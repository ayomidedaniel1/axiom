-- Enable the pgvector extension to work with embeddings
create extension if not exists vector;

-- Table to store research reports
create table reports (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  summary text,
  full_markdown text,
  created_at timestamp with time zone default now()
);

-- Table to store individual cited snippets
create table citations (
  id uuid primary key default gen_random_uuid(),
  report_id uuid references reports(id) on delete cascade,
  source_name text not null,
  url text not null,
  content text not null,
  embedding vector(1536) -- Match the dimensions of Gemini/OpenAI embeddings
);

-- =====================================================
-- USER AUTHENTICATION & CHAT HISTORY TABLES
-- =====================================================

-- User profiles (extends Supabase auth.users)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default now()
);

-- Chat conversations
create table conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  title text default 'New Chat',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Chat messages
create table messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references conversations(id) on delete cascade not null,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  metadata jsonb default '{}',
  created_at timestamp with time zone default now()
);

-- Enable Row Level Security
alter table profiles enable row level security;
alter table conversations enable row level security;
alter table messages enable row level security;

-- RLS Policies
create policy "Users can view their own profile"
  on profiles for select using (auth.uid() = id);

create policy "Users can update their own profile"
  on profiles for update using (auth.uid() = id);

create policy "Users can view their own conversations"
  on conversations for select using (auth.uid() = user_id);

create policy "Users can create their own conversations"
  on conversations for insert with check (auth.uid() = user_id);

create policy "Users can update their own conversations"
  on conversations for update using (auth.uid() = user_id);

create policy "Users can delete their own conversations"
  on conversations for delete using (auth.uid() = user_id);

create policy "Users can view messages in their conversations"
  on messages for select using (
    exists (
      select 1 from conversations
      where conversations.id = messages.conversation_id
      and conversations.user_id = auth.uid()
    )
  );

create policy "Users can insert messages in their conversations"
  on messages for insert with check (
    exists (
      select 1 from conversations
      where conversations.id = messages.conversation_id
      and conversations.user_id = auth.uid()
    )
  );

-- Indexes for performance
create index idx_conversations_user_id on conversations(user_id);
create index idx_messages_conversation_id on messages(conversation_id);

-- Function to create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to auto-create profile
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();