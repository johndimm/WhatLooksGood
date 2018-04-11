select id, business_id, 
replace(replace(caption, '\r\n',''), '\n','') as caption
from photo
where label = 'food'
;
