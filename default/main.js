var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');

var harvesterBody = [MOVE, MOVE, WORK, WORK, WORK, CARRY];
var upgraderBody = [MOVE,  MOVE, MOVE, WORK, WORK, CARRY];
var builderBody = [MOVE, WORK, CARRY];

function countDuplicates(array, value)
{
  var counter = 0;
  for (elem in array)
  {
    if (elem === value)
      counter++;
  }
  return counter;
}

function isStructureToBuild(room)
{
  var targets = room.find(FIND_CONSTRUCTION_SITES);
  if(targets.length)
    return true;
  else
    return false;
}

function isStorageFull(room)
{
  var isNotFull = false;
  for(var structure in room.find(FIND_STRUCTURES))
  {
    if ((structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN) && structure.energy < structure.energyCapacity)
    {
      isNotFull = true;
      break;
    }
  }

  return !isNotFull;
}

module.exports.loop = function ()
{
    var harvestersCount = 0, buildersCount = 0, upgradersCount = 0;
    for(var name in Game.creeps)
    {
        // Collect current amount of workers
        var creep = Game.creeps[name];

        var position = creep.room.lookAt(creep.pos);
        position.forEach(
          function(lookObject)
          {
            if (!Game.spawns["Spawn1"].memory.frequentPoints.length)
            {
              Game.spawns["Spawn1"].memory.frequentPoints = [];
            }
            else {
            if(lookObject.type != STRUCTURE_ROAD)
            {
              if(countDuplicates(Game.spawns["Spawn1"].memory.frequentPoints.length, creep.pos) >= 10)
              {
                for(var i=0; i < Game.spawns["Spawn1"].memory.frequentPoints.length; i++)
                {
                  if(Game.spawns["Spawn1"].memory.frequentPoints[i] === creep.pos)
                  {
                    Game.spawns["Spawn1"].memory.frequentPoints.splice(i, 1);
                  }
                }
                creep.pos.createConstructionSite(STRUCTURE_ROAD);
                console.log("Road is gonna to be build");
              }
              else
              {
                Game.spawns["Spawn1"].memory.frequentPoints.push(creep.pos);
              }
            }
          }
          }
        );

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
            if (!isStorageFull(creep.room))
            {
              console.log("Storage is not full");
              roleHarvester.run(creep);
            }
            else
            {
              console.log("Storage is full");
              if (isStructureToBuild(creep.room))
              {
                console.log("Harvester " + creep.name + " gonna build");
                roleBuilder.run(creep);
              }
              else
              {
                console.log("Harvester " + creep.name + " gonna upgrade");
                roleUpgrader.run(creep);
              }
            }
        }

        if(creep.memory.role == 'upgrader')
        {
          roleUpgrader.run(creep);
        }
        if(creep.memory.role == 'builder')
        {
          if (isStructureToBuild(creep.room))
          {
            roleBuilder.run(creep);
          }
          else
          {
            if (!isStorageFull(creep.room))
            {
              roleHarvester.run(creep);
            }
            else
            {
              roleUpgrader.run(creep);
            }
          }
        }
    }
    console.log("Harvesters: " + harvestersCount + ", upgraders: " + upgradersCount + ", builders: " + buildersCount);

    // Spawn harvester if needed
    if (harvestersCount < Game.spawns["Spawn1"].memory.harvestersMax)
    {
      console.log("Not enough harvesters");
      Game.spawns["Spawn1"].spawnCreep(harvesterBody, "harvester_" + (harvestersCount + 1), { memory: {role: 'harvester' } })
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
      Game.spawns["Spawn1"].spawnCreep(builderBody, "builder_" + buildersCount+1, { memory: {role: 'builder' } })
    }

}
