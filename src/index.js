import fetch from 'node-fetch';
import express from 'express';
import bodyParser from 'body-parser';

const app = express();

const port = 5000;
app.use(bodyParser.json())
app.post('/', async (req, res) => {
    res.send(await getClosestRobot(req.body.x, req.body.y, req.body.loadId));
})

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});

async function getClosestRobot(x, y) {
    const robotsJSON = {
        robots: await fetch("https://60c8ed887dafc90017ffbd56.mockapi.io/robots")
                                .then(function (response) {
                                    return response.json();
                                }
                            )
                
        };
    
    var closestDistance = Number.MAX_SAFE_INTEGER;
    
    var robotsList = [];
    robotsJSON.robots.forEach((robot) => {
        const distance = Math.sqrt(Math.pow(robot.x - x, 2) + Math.pow(robot.y - y, 2));
        if (distance > closestDistance) {
            //Do nothing
        }
        if (distance <= 10) {
            robotsList = robotsList.filter((robot) => {
                return robot.distanceToGoal <= 10
            });

            closestDistance = 10;
            robotsList.push({
                robotId : robot.robotId,
                distanceToGoal : distance.toFixed(2),
                batteryLevel : robot.batteryLevel
            });
        }
        else {
            if (distance < closestDistance) {
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

    if (robotsList.length == 1)
    {
        return robotsList[0];
    }
    else
    {
        const robotToChoose = robotsList.reduce((previousComp, currentComp) => {
            return (previousComp.batteryLevel > currentComp.batteryLevel) ? previousComp : currentComp
        });

        return robotToChoose;
    }
}

export { getClosestRobot };