drop table if exists old_photos;
drop table if exists new_photos;
drop temporary table if exists old_photos;
drop temporary table if exists new_photos;
create temporary table old_photos
(
  photo_id varchar(22)
);

load data local infile 'photos_v0s.txt' into table old_photos;

create temporary table new_photos as
select distinct photo_id as photo_id
from business_dish
order by photo_id
;

create index idx_op on old_photos(photo_id);
create index idx_np on new_photos(photo_id);

select new.photo_id
from new_photos as new
left join old_photos as old on old.photo_id=new.photo_id
where old.photo_id is null
;
