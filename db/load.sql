drop table if exists words;
create table words
(
  id varchar(22) primary key not null,
  business_id varchar(22),
  word varchar(255),
  index idx_bid (business_id),
  index idx_word (word)
);

load data local infile 'words.txt' into table words;
