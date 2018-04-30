#
# Creating the dish table.
#
# Step 1: look for captions that occur multiple times
#

drop function if exists cleanDish;
delimiter //
create function cleanDish(dish varchar(255))
returns varchar(255)
begin
  return replace(replace(replace(replace(trim(dish),'.',''),'!',''), '\r\n',''),'\n','');
end //
delimiter ;

drop table if exists total_caption;
create table total_caption as 
select  
  clean_caption as caption
  , sum(cnt) as num_photos
  , count(*) as cnt
  , max(cnt) as inside_cnt
from
(
    select b.name, cleanDish(caption) as clean_caption, count(*) as cnt
    from yelp_db.photo
    join yelp_db.business as b on b.id=photo.business_id
    where label = 'food'
    and caption not in ('', ':)')
    and locate('://', caption) = 0
    group by b.name, clean_caption
    # having cnt > 1
    order by cnt desc
) as t
where length(clean_caption) - length(replace(clean_caption, ' ','')) < 3
group by clean_caption
having cnt > 1
order by cnt desc
;


select *
from total_caption
order by length(caption)
;

