# SVT Robotics Take Home Test - Basel Anani

### 1. API Written in JS
The code for the API can be found in src/index.js. The route to send the POST request JSON to is http://localhost:500/api/robots/closest
Should you choose to modify the listening port you may modify the `port` constant

### 2. API can be run locally and tested using Postman or similar web tools

- Environment
    - This application uses `Node v16.18.0`
        - This applications depends on [node-fetch v2.6.7](https://www.npmjs.com/package/node-fetch/v/2.6.1), [express v4.18.2](https://www.npmjs.com/package/express), and [body-parser v1.20.1](https://www.npmjs.com/package/body-parser)
- Running the application
    - After cloning this repository, in a terminal directory `cd` in to the root project directory and run `npm install`
    - After package installation is complete run `node ./src/index.js`, a message in the terminal stating `Listening on port 5000` indicates the server is up and runnning
- Testing with [Postman](https://learning.postman.com/docs/getting-started/introduction/)
    - Select `New` on the left side of the screen near where it says `Scratch Pad`
    - Select `HTTP Request`
    - In the URL text box type `http://localhost:5000/api/robots/closest`
    - Change the request method from `GET` to `POST` using the dropdown menu
    - Select the `Body` tab, select the `raw` bullet point and change the input type to `JSON` from the dropdown (defaults to `Text`)
    - Send a request that follows the following pattern
    ```json
    {
        "loadId" : <some-integer>,
        "x" : <some-integer>,
        "y" : <some-integer>
    }
    ```
    - Click the send button, the API response will be visible at the bottom of the view in the `Response` section
- Testing with [cURL](https://curl.se/docs/)
    - If curl is not installed, follow installation instructions in the linked Curl docs, verify installation with `curl --version`
    - Run `curl -X POST http://localhost:5000/api/robots/closest -H "Content-Type: application/json" -d '{"loadId": <some-integer>, "x": <some-integer>, "y": <some-integer>}'`
    - The response will be returned inside the terminal
### 3. Description of features, functionality I would add and how I would implement them

- Features I would implement
    - My initial thought was well what would we do after we idenitfy which robot is responsible for moving and picking up the load? It stands to reason that the robots are perhaps updating their location within the API, with this thought in mind, perhaps we want to add a listener to the API listening to changes to the robot's location. We could use a WebSocket with a small enough refresh and track the movements of that robot towards the load. Expanding on this we could set up a route to track load pick-ups with statuses such as queued, en-route, and picked-up. When the load is sent and an appropriate robot is identified we could set that status of the load to queued. As the robot begins to move towards it's destination updates to the location would trigger an en-route status. Upon arrival to the load, the status could move to picked-up. We could take this tracking even further if we were to obtain the destination x,y-coordinates and add a status of delivered to the load tracking pickups

    - I would also implement a comprehensive testing infrastructure, in this project we are able to test manually through sending mock requests to Postman and we could with some work manually verify the results. What would be much more efficient would be to automate our testing infrastructure to verify that our robot choosing algorithm is actually picking out the optimal solution based on the problem parameters we are given. I would use [Jest](https://jestjs.io/docs/getting-started) for unit testing. So as to not add stress to our API with test calls on top of the calls that our API would be getting in production we could store a limited data set and then mock the HTTP request to the robots API and have it return the limited list of robots. We would want to test each of the different code paths that it is possible for us to follow so the tests I would implement would be the following test
        - Test route `/{some_random_string}` returns a proper `404 - Not Found` Response
        - Test blank route `/` renders a proper `404 - Not Found`
        - Test request to `/api/robots/closest` that does not contain a `loadId` returns a `400 - Bad Request` Response
        - Test request to `/api/robots/closest` that does not contain an `x` or `y` coordinate returns a `400 - Bad Request` Response
        - Test request to `/api/robots/closest` to some arbitrarily far x,y-coordinate pairing returns the closest robot
        - Test request to `/api/robots/closest` to a point close to a cluster of data points returns the robot with highest battery percentage
    
    - The last thing it occured to me implement would be some sort of security infrastructure. At the moment the way this API is configured anyone could call it and identify a robot, but perhaps we would want to restrict the ability to call the API to a specific process or user, we could use an OAuth approach and use identity token verification to ensure that the user/service a) is who they say they are and b) has the priveleges to access/modify the data being utilized

