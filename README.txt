Name: Yumejichi Fujita
Student ID: 20765628


Final Project Description:
This assignment let me get familiar with how to use the Jquery mainly to change the UI and other functions.

Challenges Faced:
- About uploading images, I referred to : https://www.geeksforgeeks.org/upload-and-retrieve-image-on-mongodb-using-mongoose/
- The issue was that the static (files html page) were not being served correctly, resulting in the application not displaying as expected. 
- This was due to incorrect setup of the static middleware and possibly incorrect paths in the HTML files.
  Referred to the express documet: https://expressjs.com/en/starter/static-files.html
- how to compare the paswword and usremail in login page: https://www.mongodb.com/blog/post/password-authentication-with-mongoose-part-1
- Initially, I was using react as the front end, but it was too hard to debug, so I cahnged to templating(handlerbar) to manage the views.


- Use lean() in Mongoose Query:
The easiest and most recommended way to handle this is to convert the Mongoose documents to plain JavaScript objects by using the lean() method in your Mongoose query. This strips away the Mongoose document methods and makes them plain objects, which Handlebars can easily work with.

- The favourite posts function: I gave up to add this function since it was hard to figure out the problem in limited time. I successfully added favourite buttons in the home.hbs page but seems didn't work well whcn click it. I am thinking continue thinking about how to let it work after this course.

Resources Used:
* The pdf materials from the classes.
* Searched on google and found similar questions raised by other people or some description site(ex.https://www.w3schools.com/html) when I didn’t know how to solve the problem.
* When error occured, asked chatgpt which site I can study to fix it.