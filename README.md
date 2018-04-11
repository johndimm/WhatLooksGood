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


