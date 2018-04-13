    
   drop table if exists sample_photo;
   create table sample_photo as

    select business_id, min(photo_id) as photo_id
    from (
        #
        # Get all photos from this business for the sample dish.
        #
        select bd.business_id, bd.photo_id from
        business_dish as bd
        join (
            #
            # Find sample dish.
            #
            select bdc.business_id, t.cnt, min(bdc.dish_id) as dish_id
            from business_dish_cnt as bdc
            join (
                #
                # Find dishes with max count for this business.
                #
                select bdc.business_id, max(bdc.cnt) as cnt
                from business_dish_cnt as bdc
                #join relbus as r on r.business_id = bdc.business_id
                group by bdc.business_id
            ) as t on t.business_id = bdc.business_id and t.cnt = bdc.cnt
            group by bdc.business_id
            order by bdc.business_id
        ) as t2 on t2.business_id = bd.business_id and t2.dish_id = bd.dish_id
    ) as t3
    group by business_id
    ;
