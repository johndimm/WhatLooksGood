# WhatLooksGood
John Dimm

Browse dishes and restaurants using photos from the [Yelp Data Challenge](https://www.yelp.com/dataset/challenge).    

http://www.johndimm.com/yelp_db_caption/app/

## Motivation

We want pancakes, so we search breakfast places and scan the photos to see who has the best looking pancakes. It would be so much easier if we could see pictures of pancakes from different restaurants on the same page.   Instead, from the restaurant search results page, we click a link, go down to the restaurant page, and from there click on a photo. Click next and skip past all the non-pancakes.  To go to the next restaurant, it's back up twice and down a different path.  

I want to start my exploration of dining options by asking what we want to eat, not where.

## Cheap trick

For this to work, we need to know the object that is shown in a photo.  It turns out there is a very effective and simple method that produces remarkably clean data with little effort, given this particular set of photos. 

The cheap trick is to notice that although some people write a comment in the caption of a photo, others are not so creative.  They just say what it is.   That is a lucky win-win -- the user saves mental energy, we get useful data.

The first step in extracting a list of dishes is to look for multiple captions that match exactly.  If two people have captioned a picture "spam musubi" and posted it to yelp as a food picture, we assume spam musubi is a dish.  What could go wrong?

## Natural Language Processing

The second step is to expand that list by looking for noun phrases in captions.  If a caption has a single noun phrase, and there are multiple captions containing the same single noun phrase, assume it is a dish.

## The concept of dish

We have a list of strings that appear to be menu items or dishes.  To apply that information to the full set of captions, search every dish in each caption.  The photo caption also gives the restaurant where the picture was taken.

## Restaurants serve dishes

We now have a set of core dish names along with their photos and restaurants.  We could make a search interface.  But that is likely to be frustratingly sparse.  Can we provide interesting links so you don't miss searching?

For a dish, it's clear that we want to show all the photos of the dish taken at various restaurants.  You can click on a restaurant to switch to the restaurant view, where the photos are of all dishes offered at the restaurant (at least the ones that have been photographed and nicely captioned).  But it will be easy to get stuck in a rut.  We need something more, some way of changing the subject without starting a new session.  We need related restaurants and related dishes.

## Recommendations

A simple way of recommending movies that are similar to a given movie:

  - find all the people who liked the movie
  - count up all the other movies those people liked
  - compare counts to global counts
  - show the ones that are disproportionately represented 
  
That depends on a single relationship, the "like" relation between people and movies.  We have a different one here, between dishes and restaurants, but can apply the same technique.  We can also do it both ways, getting similar dishes using dish-restaurant-dish and similar restaurants using restaurant-dish-restaurant.


