var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');

var harvesterBody = [MOVE, WORK, CARRY];
var upgraderBody = [MOVE, WORK, CARRY];


module.exports.loop = function ()
{
    console.log("Github test");
    var harvestersCount = 0, buildersCount = 0, upgradersCount = 0;
    for(var name in Game.creeps)
    {
        // Collect current amount of workers
        var creep = Game.creeps[name];
        if (name.split("_")[0] == "harvester")
        {
          harvestersCount++;
        }
        if (name.split("_")[0] == "upgrader")
        {
          upgradersCount++;
        }
        if (name.split("_")[0] == "builder")
        {
          buildersCount++;
        }

        // Assign roles to workers
        if(creep.memory.role == 'harvester')
        {
            if (Game.spawns["Spawn1"].energyCapacity == Game.spawns["Spawn1"].energy)
            {
              roleBuilder.run(creep);
            }
            else
            {
              roleHarvester.run(creep);
            }
        }
        if(creep.memory.role == 'upgrader')
        {
          roleUpgrader.run(creep);
        }
        if(creep.memory.role == 'builder')
        {
          roleBuilder.run(creep);
        }
    }
    console.log("Harvesters: " + harvestersCount + ", upgraders: " + upgradersCount + ", builders: " + buildersCount);


    // Spawn harvester if needed
    if (harvestersCount < Game.spawns["Spawn1"].memory.harvestersMax)
    {
      console.log("Not enough harvesters");
      Game.spawns["Spawn1"].spawnCreep(harvesterBody, "harvester_" + (harvestersCount + 1), { memory: {role: 'harvester' } })
      console.log(harvestersCount + 1);
    }
    // Spawn upgrader if needed
    if (upgradersCount < Game.spawns["Spawn1"].memory.upgradersMax)
    {
      console.log("Not enough upgraders");
      Game.spawns["Spawn1"].spawnCreep(upgraderBody, "upgrader_" + upgradersCount+1, { memory: {role: 'upgrader' } })
    }

    if (buildersCount < Game.spawns["Spawn1"].memory.buildersMax)
    {
      console.log("Not enough builders");
      Game.spawns["Spawn1"].spawnCreep(upgraderBody, "builder_" + buildersCount+1, { memory: {role: 'builder' } })
    }

}
