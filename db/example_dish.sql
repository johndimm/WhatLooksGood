#
# Used for the doc.
#

select *
from dish
where source='exact'
limit 10;

select *
from dish
where source='substring'
limit 10;
