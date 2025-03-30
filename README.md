# Next Stop

## Inspiration
After our train was delayed for several hours, making us late to this hackathon, we realized how frustrating it is to deal with Amtrak delays. We wanted to create a solution that would help people make the most of their wait time rather than just sitting around. Our goal was to turn a stressful situation into something more enjoyable by offering fun and useful activities nearby. With this in mind, we built an app that provides suggestions based on user interests and train delays.

## What it does
Our project helps users find and schedule activities near their Amtrak station while waiting for a delayed train. It considers the delay time to ensure the recommended activities fit within the available time frame. Users can input their interests, and the app will personalize the suggestions based on those preferences as well as create a schedule for them to make the most of their time. Additionally, it provides real-time updates on train delays and early arrivals, helping travelers plan their time more efficiently. 

## How we built it
We used the Places API to search for nearby attractions and identify user-specified locations as well as match station names with the corresponding Amtrak ID. The Amtrak API provided train and station data, which we used to calculate delays and arrival times. Our front-end was developed using React and styled with TailwindCSS, while Express handled backend API fetching. We also integrated the Gemini API for prompt engineering, which helped generate schedules and match station locations with station IDs. Finally, to calculate the route times between a user’s current location to their desired activity, we used the Routes API. 

## Challenges we ran into
One of the biggest challenges was finding a reliable Amtrak API with up-to-date and detailed information, as Amtrak does not publish a lot of public data. To overcome this, we had to calculate delays ourselves based on available train data. As first-time hackers, we also had to learn how to effectively integrate multiple APIs into one functional system. Debugging API responses and making sure all the data worked together smoothly was another tricky part of the process. Finally, another issue we had was integrating our UI efficiently with our backend. 

## Accomplishments that we're proud of
We’re proud that we were able to accurately calculate train delays and display them in a user-friendly way on our website. Another major accomplishment was successfully integrating different APIs to gather data and provide personalized recommendations. Even as first-time hackers, we managed to build a fully functional app within the limited time of the hackathon. We also took our project a step further by using the Gemini API to filter and organize locations based on user preferences.

## What we learned
Throughout this project, we learned how to integrate multiple APIs and use them together to create a practical solution. We gained experience in website development using React and TailwindCSS, which helped us improve our front-end skills. We also learned about backend development with Express and how to fetch and process data efficiently. Additionally, working with AI-powered tools like Gemini helped us understand prompt engineering and data filtering better.

## What's next for Next Stop
We plan to add a phone call feature to make the service more accessible for users who may not want to use the website. Implementing user logins is another goal, allowing travelers to save their favorite places and frequently used trains or stations. Security improvements will also be a focus, ensuring user data is protected. Finally, we want to refine our AI model by improving the prompts we use for the Gemini API and potentially training our model for better accuracy.
