#
# Just a list of the core dishes.
# Put this in memory, it's about 250 records.
#
drop table if exists dish;
create table dish
(
  id int auto_increment primary key,
  dish varchar(255),
  inside_cnt int,
  source enum('exact','substring'),
  index idx_dish(inside_cnt)
);

#
#  Combined whole captions with singleton phrases.
#  Use only multi-word singletons, to avoid a lot of noise.
#
insert into dish
(dish, source, inside_cnt)
select trim(caption) as dish, 'exact' as source, inside_cnt
from total_caption
union
select trim(caption) as dish, 'substring' as source, 1 as inside_cnt
from singleton_phrase
where length(trim(caption)) > 3
and length(caption) - length(replace(caption,' ', '')) > 1
; 


#
# Remove plurals where singular is found.
# If we have both tacos and taco, keep only taco, 
# since it will match tacos in captions.
#
SET SQL_SAFE_UPDATES = 0;
delete dish from dish
join (
select a.dish as adish, b.dish as bdish, b.id as bid
from dish as a
join dish as b on 
#locate(b.dish, a.dish) > 0
b.dish = concat(a.dish, 's')
) as t on t.bid = dish.id
;

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
# Count the total number of photos and businesses for a given dish.
#
drop table if exists dish_cnt;
create table dish_cnt as
select dish_id, count(*) cnt, count(distinct name) bus_name_cnt
from business_dish as bd
join business as b on b.id = bd.business_id
group by dish_id
order by bus_name_cnt desc
;
#
# Grand total of all dish photos.
#
set @global_dish = (select sum(cnt) from dish_cnt);
select @global_dish;

