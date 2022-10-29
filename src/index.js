import fetch from 'node-fetch';
import express from 'express';
import bodyParser from 'body-parser';

// Set up express js settings to serve the application
const app = express();
const port = 5000;
app.use(bodyParser.json())

// Log message to let the user know we are successfully listening to the port
app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});

// Set up the route to post to in this case we can just hit the base url
app.post('/api/robots/closest', async (req, res) => {
    if (req.body.x == null || isNaN(req.body.x)) {
        res.send({
            status: 400,
            message: "Bad request: No x-coordinate provided or was not a number"
        });
    } else if (req.body.y == null || isNaN(req.body.y)) {
        res.send({
            status: 400,
            message: "Bad request: No y-coordinate provided or was not a number"
        });
    } else if (req.body.loadId == null || isNaN(req.body.loadId)) {
        res.send({
            status: 400,
            message: "Bad request: No loadId provided or was not a number"
        });
    }
    else {
        res.send(await getClosestRobot(req.body.x, req.body.y, req.body.loadId));
    }
});

// All other routes/requests will be shown a JSON 404 Not Found Error
app.use('*', function(req, res) {
    res.send({
        error: 404,
        message: "Not Found"
    })
});

async function getClosestRobot(x, y) {
    // Calling the API in the provided README -> ../README.md
    const robotsJSON = {
        robots: await fetch("https://60c8ed887dafc90017ffbd56.mockapi.io/robots")
                                .then(function (response) {
                                    return response.json();
                                }
                            )
                
        };
    
    // Set closest distance to some arbitrarily large number and so that we never skip the first result
    var closestDistance = Number.MAX_SAFE_INTEGER;
    
    var robotsList = [];
    // This block contains our logic for determining what robots we want to pick
    robotsJSON.robots.forEach((robot) => {
        // This reprents the sqrt((x_2 - x_1)^2 + (y_2 - y_1)^2) formula in README
        const distance = Math.sqrt(Math.pow(robot.x - x, 2) + Math.pow(robot.y - y, 2));
        if (distance <= 10) {
            // This wil clear the list of any results where the distance is > 10
            robotsList = robotsList.filter((robot) => {
                return robot.distanceToGoal <= 10
            });
            // Set closest distance to 10 because under 10 we are choosing by batteryLevel Property
            closestDistance = 10;
            robotsList.push({
                robotId : robot.robotId,
                distanceToGoal : distance.toFixed(2),
                batteryLevel : robot.batteryLevel
            });
        }
        else {
            if (distance < closestDistance) {
                // Clear the list because here we are only concerned with the closest if our distance is greater than 10
                robotsList = [];
                robotsList.push({
                    robotId : robot.robotId,
                    distanceToGoal : distance.toFixed(2),
                    batteryLevel : robot.batteryLevel
                });
                closestDistance = distance;
            }
        }
    });

    // Should only be the case if all robots are > 10 units of distance away from x,y coordinates
    if (robotsList.length == 1)
    {
        return robotsList[0];
    }
    else
    {
        // This reduce allows us to select the robot with highest battery level
        const robotToChoose = robotsList.reduce((previousComp, currentComp) => {
            return (previousComp.batteryLevel > currentComp.batteryLevel) ? previousComp : currentComp
        });

        return robotToChoose;
    }
}