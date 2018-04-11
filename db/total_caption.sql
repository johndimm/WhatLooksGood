#
# Creating the dish table.
#
# Step 1: look for captions that occur multiple times
#
drop table if exists total_caption;
create table total_caption as 
select  
  replace(replace(caption, '\r\n',''), '\n','') as caption
  , sum(cnt) as num_photos
  , count(*) as cnt
from
(
    select b.name, caption, count(*) as cnt
    from yelp_db.photo
    join yelp_db.business as b on b.id=photo.business_id
    where label = 'food'
    and caption not in ('', ':)')
    and locate('://', caption) = 0
    group by b.name, caption
    having cnt > 1
    order by cnt desc
) as t
where length(caption) - length(replace(caption, ' ','')) < 3
group by caption
having cnt > 1
order by cnt desc
;

#
# Step 2: Add other captions that contain the core dishes. (not used )
#
drop table if exists total_caption_ex;
create table total_caption_ex as
select wc.caption as food_item, photo.id as photo_id, photo.caption
from yelp_db.photo
join total_caption as wc on locate(wc.caption, photo.caption) > 0
order by food_item, length(photo.caption)
;

select *
from total_caption
order by length(caption)
;

