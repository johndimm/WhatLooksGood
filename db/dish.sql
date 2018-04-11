#
# Just a list of the core dishes.
# Put this in memory, it's about 250 records.
#
drop table if exists dish;
create table dish
(
  id int auto_increment primary key,
  dish varchar(255),
  source enum('exact','substring')
);

#
#  Combined whole captions with singleton phrases.
#  Use only multi-word singletons, to avoid a lot of noise.
#
insert into dish
(dish, source)
select trim(caption) as dish, 'exact' as source
from total_caption
union
select trim(caption) as dish, 'substring' as source
from singleton_phrase
where length(trim(caption)) > 3
and length(caption) - length(replace(caption,' ', '')) > 1
; 

select * from dish;

#
# business -> photo -> dish 
#
drop table if exists business_dish;
create table business_dish (
  id int auto_increment primary key,
  business_id varchar(22),
  dish_id int,
  source enum('exact', 'substring'),
  photo_id varchar(22),
  matched bool
);


insert into business_dish
(business_id, dish_id, source, photo_id, matched)
select
  business_id, dish.id as dish_id, dish.source, photo.id as photo_id,
  (dish.dish = photo.caption) as matched
from dish
#join yelp_db.photo on locate(dish.dish, photo.caption) > 0
join photo on locate(dish.dish, photo.caption) > 0
;

create index idx_bd1 on business_dish(business_id);
create index idx_bd2 on business_dish(dish_id);

#
# Count the number of photos of particular dishes for a business.
#
drop table if exists business_dish_cnt;
create table business_dish_cnt as
select business_id, dish_id, source, count(*) as cnt
from business_dish
group by business_id, dish_id
;

create index idx_bd1 on business_dish_cnt(business_id);
create index idx_bd2 on business_dish_cnt(dish_id);

#
# Count the total number of dish photos for a given business.
#
drop table if exists business_cnt;
create table business_cnt as
select business_id, count(*) as cnt
from business_dish
group by business_id
;

#
# Count the total number of businesses for a given dish.
#
drop table if exists dish_cnt;
create table dish_cnt as
select dish_id, count(*) cnt
from business_dish
group by dish_id
;

#
# Grand total of all dish photos.
#
set @global_dish = (select sum(cnt) from dish_cnt);
select @global_dish;

