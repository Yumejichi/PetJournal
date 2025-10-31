Project Description:
This is a website that people can post photos of their pets!

Challenges Faced:
- About uploading images, I referred to : https://www.geeksforgeeks.org/upload-and-retrieve-image-on-mongodb-using-mongoose/
- The issue was that the static (files html page) were not being served correctly, resulting in the application not displaying as expected. 
- This was due to incorrect setup of the static middleware and possibly incorrect paths in the HTML files.
  Referred to the express documet: https://expressjs.com/en/starter/static-files.html
- how to compare the paswword and usremail in login page: https://www.mongodb.com/blog/post/password-authentication-with-mongoose-part-1
- Initially, I was using react as the front end, but it was too hard to debug, so I cahnged to templating(handlerbar) to manage the views.


- Use lean() in Mongoose Query:
The easiest and most recommended way to handle this is to convert the Mongoose documents to plain JavaScript objects by using the lean() method in your Mongoose query. This strips away the Mongoose document methods and makes them plain objects, which Handlebars can easily work with.

