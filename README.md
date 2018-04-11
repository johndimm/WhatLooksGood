# WhatLooksGood
John Dimm

Browse dishes and restaurants from the [Yelp Dataset Challenge](https://www.yelp.com/dataset/challenge).  The data for the interface appears to have been curated by humans, or produced by very accurate computer vision object recognition, but no humans or neural nets were employed.  The model was created using only user photo caption text.  It identifies objects from the co-occurrence of phrases in caption text, and builds two recommender systems on the binary relation between restaurants and their dishes. 

http://www.johndimm.com/yelp_db_caption/app/

<img src="http://www.johndimm.com/yelp_db_caption/app/WhatLooksGood_screenshot.png" width=600 />

## Motivation

You are hungry for pancakes, so you search breakfast places and scan the photos to see who has the best looking pancakes.  Lots of clicks and navigation.  It would be so much easier if you could see pictures of pancakes from different restaurants on the same page.  

I want to start my exploration of dining options by asking *what* we want to eat, not *where*.

## The concept of dish

For this to work, we need to know the object that is shown in a photo.  Photo captions are too specific, often unique.  We need to find a way to extract something that will be the same across multiple restaurants.

How can we know what a photo is a photo *of*?  Object recognition by computer vision is one option.  

It turns out there is a very effective and simple method that produces remarkably clean data with little effort, given this particular set of photos.  

The cheap trick is to notice that although some people write a comment in the caption of a photo, others are not as creative.  They just say what it is.   

![lobster roll](http://www.johndimm.com/yelp_db_caption/app/lobster_roll.png)

That is a lucky win-win -- the user saves mental energy, we get useful data.

The first step in extracting a list of dishes is to look for multiple captions that match exactly.  If two people have captioned a picture "spam musubi" and posted it to yelp as a food picture, we assume spam musubi is a dish.  What could go wrong?  We found 130 of these.

    +----+-----------------+--------+
    | id | dish            | source |
    +----+-----------------+--------+
    |  1 | Takoyaki        | exact  |
    |  2 | Oysters         | exact  |
    |  3 | Pad Thai        | exact  |
    |  4 | Chicken Wings   | exact  |
    |  5 | Fried Chicken   | exact  |
    |  6 | Pepperoni Pizza | exact  |
    |  7 | Wings           | exact  |
    |  8 | Calamari        | exact  |
    |  9 | Lobster roll    | exact  |
    | 10 | Burger          | exact  |


## Natural Language Processing

The second step is to expand that list by looking for noun phrases in captions.  If a caption has a single noun phrase, and there are multiple captions containing the same single noun phrase, assume it is a dish.  Using the NLTK for Python, we found 2,131 of these.

    +-----+------------------+-----------+
    | id  | dish             | source    |
    +-----+------------------+-----------+
    | 131 | french toast     | substring |
    | 132 | caesar salad     | substring |
    | 133 | chicken salad    | substring |
    | 134 | eggs benedict    | substring |
    | 135 | lamb chops       | substring |
    | 136 | foie gras        | substring |
    | 137 | chicken sandwich | substring |
    | 138 | beet salad       | substring |
    | 139 | pork sandwich    | substring |
    | 140 | spring rolls     | substring |

## Extending the dish concept

We have a list of strings that appear to be menu items or dishes.  To apply that information to the full set of captions, search every dish in each caption. If a caption contains the word "burger", we assume it can be usefully shown on the Burger page, even if it does not contain a burger.  (It turns out these exceptions are rare.)  The photo caption also helps out by providing the restaurant where the picture was taken.  We found 63,922 of these matches.

    +----+------------------------+---------+-----------+------------------------+---------+
    | id | business_id            | dish_id | source    | photo_id               | matched |
    +----+------------------------+---------+-----------+------------------------+---------+
    |  1 | XIg92ukZJn_1aiNx0OmusQ |      24 | exact     | --0uqWanwN31OkuuwJ1zjQ |       0 |
    |  2 | If6Bku2jkgPiikR6HBu-XQ |    1983 | substring | --3vR19cePIkGQBgcLsQkw |       0 |
    |  3 | ICdoTODBaprN0UReete9VQ |     142 | substring | --9fNU-8m06bbXM3jIha_w |       0 |
    |  4 | C9xw2AkDMtWMQ3sIDo98aA |     781 | substring | --a8uNdcCabbj7HuhX9bVQ |       0 |
    |  5 | sH3UsolKjik01u0HlQ9_0Q |      45 | exact     | --daSIW0JaPBNaJIC0-p8A |       0 |
    |  6 | SJU-jRAZS0cXoBGUjX5GUg |      77 | exact     | --DpaHUw76HtjHogXfLXnA |       0 |
    |  7 | cSSgeQQOz2modfT7zTHJHQ |     123 | exact     | --GxTabLHDiUMpwUntf03A |       0 |
    |  8 | AKBSPjk_H_w8RCqCE_vUuA |      38 | exact     | --ifyOhCW51WtECbrsEbbA |       0 |
    |  9 | AKBSPjk_H_w8RCqCE_vUuA |     433 | substring | --ifyOhCW51WtECbrsEbbA |       0 |
    | 10 | BjrKNWhtQkedHw8hP_0Bjg |      13 | exact     | --je29Go4V-WYQw0TvtypA |       0 |


## Restaurants serve dishes

We now have a set of core dish names along with their photos and restaurants.  We could create a standard search interface.  But the search space is likely to be frustratingly sparse.  Many reasonable queries would give a null response.  

Restaurant search is provided already by yelp.  In this UI, we want to suggest interesting connections rather than requiring you to find them.    

Two obvious lists:

  - For a dish, it's clear we want to show all the photos of the dish taken at various restaurants.  
  
  - For a restaurant, it's clear we want to show all the dishs available at that restaurant.
  
Beyond these, we need some way to move directly from one restaurant to another related restaurant.  Same for dishes.  

## Recommendations

A simple way of recommending movies that are similar to a given movie:

  - find all the people who liked the movie
  - count up all the other movies those people liked
  - compare counts to global counts
  - show the ones that are disproportionately represented 
  
That depends on a single relationship, the "like" relation between people and movies.  We have a different one here, between dishes and restaurants, but can apply the same technique.  We can also do it both ways, getting similar dishes using dish-restaurant-dish and similar restaurants using restaurant-dish-restaurant.

## Example of dish-to-dish recommendations

Let's go through the details of finding recommended dishes.  To keep the data from exploding, we'll pick one of these dishes offered at only three restaurants:

        +-----------------------+---------+-----+
        | dish                  | dish_id | cnt |
        +-----------------------+---------+-----+
        | fried avocado         |     827 |   3 |
        | slider trio           |     835 |   3 |
        | nachos grande         |     838 |   3 |
        | lemongrass soup       |     841 |   3 |
        | vegetable pakoras     |     845 |   3 |
        | delicious desserts    |     853 |   3 |
        | poki bowl             |     865 |   3 |
        | canadian pizza        |     878 |   3 |
        | mixed paella          |     889 |   3 |
        | table bread           |     890 |   3 |
        | pappardelle bolognese |     891 |   3 |
        | ikura nigiri          |     904 |   3 |
        | nabeyaki udon         |     905 |   3 |
        | dahi puri             |     925 |   3 |
        | cauliflower steak     |     928 |   3 |
        | asparagus bacon       |     939 |   3 |
        | pizza fries           |     948 |   3 |
        | quinoa burger         |     949 |   3 |
        | chicken risotto       |     953 |   3 |
        | bruschetta trio       |     958 |   3 |
        +-----------------------+---------+-----+

We pick fried avocado.  Here are the three restaurants:

        +------------------------+
        | name                   |
        +------------------------+
        | Macayo's Mexican Table |
        | El Hefe                |
        | Jalisco Cantina        |
        +------------------------+

What dishes are offered by all three?  We also count the number of photos taken, across the three restaurants.

        +-----------------+-----+
        | dish            | cnt |
        +-----------------+-----+
        | Tacos           |   6 |
        | carne asada     |   5 |
        | carnitas        |   3 |
        | fried avocado   |   3 |
        | cheese crisp    |   2 |
        | Fish taco       |   2 |
        | mexican pizza   |   2 |
        | Shrimp          |   2 |
        | taco salad      |   1 |
        | chicken taco    |   1 |
        | Fish tacos      |   1 |
        | mixed fajitas   |   1 |
        | combo plate     |   1 |
        | fiesta salad    |   1 |
        | Burger          |   1 |
        | Nachos          |   1 |
        | i love          |   1 |
        | al pastor       |   1 |
        | fried fish      |   1 |
        | grilled chicken |   1 |
        | duck carnitas   |   1 |
        | Pork Carnitas   |   1 |
        | Food            |   1 |
        | pork taco       |   1 |
        +-----------------+-----+
        
No surprize that tacos tops the list.  But we are looking for dishes that are disproportionately represented in this list.  So let's pull the global counts for these dishes, across all restaurants in the corpus:
 
         +-----------------+-------------+--------------+
        | dish            | local_count | global_count |
        +-----------------+-------------+--------------+
        | Tacos           |           6 |          908 |
        | carne asada     |           5 |          187 |
        | carnitas        |           3 |          114 |
        | fried avocado   |           3 |            3 |
        | Shrimp          |           2 |         2440 |
        | Fish taco       |           2 |          200 |
        | mexican pizza   |           2 |            5 |
        | cheese crisp    |           2 |           24 |
        | Burger          |           1 |         2095 |
        | Fish tacos      |           1 |          131 |
        | Nachos          |           1 |          342 |
        | Pork Carnitas   |           1 |           15 |
        | Food            |           1 |         2026 |
        | taco salad      |           1 |           23 |
        | al pastor       |           1 |           89 |
        | chicken taco    |           1 |           63 |
        | combo plate     |           1 |           17 |
        | pork taco       |           1 |           33 |
        | fried fish      |           1 |           38 |
        | grilled chicken |           1 |          224 |
        | duck carnitas   |           1 |            5 |
        | fiesta salad    |           1 |            8 |
        | i love          |           1 |          178 |
        | mixed fajitas   |           1 |            4 |
        +-----------------+-------------+--------------+

The strategy we use now is to scale the local counts to match the global counts.  We pretend that these dishes are the only dishes in the database.

         #
         # Normalize local counts so they can be compared to global counts.
         #
         set @local_total = (select sum(local_count) from related_dish_cnt);
         set @global_total = (select sum(global_count) from related_dish_cnt);
         set @factor = @global_total / @local_total;

The normalized counts:

        +-----------------+-------------+--------------+------------------------+
        | dish            | local_count | global_count | normalized_local_count |
        +-----------------+-------------+--------------+------------------------+
        | Tacos           |           6 |          908 |                   1342 |
        | carne asada     |           5 |          187 |                   1119 |
        | carnitas        |           3 |          114 |                    671 |
        | fried avocado   |           3 |            3 |                    671 |
        | Shrimp          |           2 |         2440 |                    447 |
        | Fish taco       |           2 |          200 |                    447 |
        | mexican pizza   |           2 |            5 |                    447 |
        | cheese crisp    |           2 |           24 |                    447 |
        | Burger          |           1 |         2095 |                    224 |
        | Fish tacos      |           1 |          131 |                    224 |
        | Nachos          |           1 |          342 |                    224 |
        | Pork Carnitas   |           1 |           15 |                    224 |
        | Food            |           1 |         2026 |                    224 |
        | taco salad      |           1 |           23 |                    224 |
        | al pastor       |           1 |           89 |                    224 |
        | chicken taco    |           1 |           63 |                    224 |
        | combo plate     |           1 |           17 |                    224 |
        | pork taco       |           1 |           33 |                    224 |
        | fried fish      |           1 |           38 |                    224 |
        | grilled chicken |           1 |          224 |                    224 |
        | duck carnitas   |           1 |            5 |                    224 |
        | fiesta salad    |           1 |            8 |                    224 |
        | i love          |           1 |          178 |                    224 |
        | mixed fajitas   |           1 |            4 |                    224 |
        +-----------------+-------------+--------------+------------------------+
        
To find the most interested related dishes, we look at the percent difference between local and global counts.
   
        (normalized_local_count - global_count) / global_count as score
  
Finally, we get this list of recommended dishes.  It turns out the mexican pizza is at the top, even though there are only 2 photos of it across these three restaurants.  That's mainly because there are only 5 photos across all restaurants.  
  
        +-----------------+----------+
        | dish            | score    |
        +-----------------+----------+
        | fried avocado   | 222.6667 |
        | mexican pizza   |  88.4000 |
        | mixed fajitas   |  55.0000 |
        | duck carnitas   |  43.8000 |
        | fiesta salad    |  27.0000 |
        | cheese crisp    |  17.6250 |
        | Pork Carnitas   |  13.9333 |
        | combo plate     |  12.1765 |
        | taco salad      |   8.7391 |
        | pork taco       |   5.7879 |
        | carne asada     |   4.9840 |
        | fried fish      |   4.8947 |
        | carnitas        |   4.8860 |
        | chicken taco    |   2.5556 |
        | al pastor       |   1.5169 |
        | Fish taco       |   1.2350 |
        | Fish tacos      |   0.7099 |
        | Tacos           |   0.4780 |
        | i love          |   0.2584 |
        | grilled chicken |   0.0000 |
        | Nachos          |  -0.3450 |
        | Shrimp          |  -0.8168 |
        | Food            |  -0.8894 |
        | Burger          |  -0.8931 |
        +-----------------+----------+
  
   
