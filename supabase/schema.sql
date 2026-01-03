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