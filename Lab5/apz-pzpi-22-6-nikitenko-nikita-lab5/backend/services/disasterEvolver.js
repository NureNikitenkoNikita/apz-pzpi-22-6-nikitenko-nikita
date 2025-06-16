const { Disaster } = require('../models');

function moveDisaster(disaster, latOffset, lonOffset, endChance) {
    const lastPos = disaster.path[disaster.path.length - 1];
    const newLat = lastPos[0] + (Math.random() - 0.5) * latOffset;
    const newLon = lastPos[1] + (Math.random() - 0.5) * lonOffset;
    
    disaster.latitude = newLat;
    disaster.longitude = newLon;
    disaster.path.push([newLat, newLon]);
    disaster.changed('path', true); // Важливо для збереження JSONB

    if (Math.random() < endChance) disaster.status = 'ended';
    return disaster.save();
}

function growRadius(disaster, growthAmount, endChance, maxSize) {
    disaster.radius += growthAmount;
    if (Math.random() < endChance || disaster.radius > maxSize) disaster.status = 'ended';
    return disaster.save();
}

async function evolveDisasters(io) {
    const activeDisasters = await Disaster.findAll({ where: { status: 'active' }});

    for (const disaster of activeDisasters) {
        let updatedDisaster;
        switch (disaster.type) {
            case 'Hurricane':
                updatedDisaster = await moveDisaster(disaster, 0.5, 0.5, 0.05);
                break;
            case 'Tornado':
                updatedDisaster = await moveDisaster(disaster, 0.1, 0.1, 0.2);
                break;
            case 'Wildfire':
                updatedDisaster = await growRadius(disaster, 2000, 0.1, 100000);
                break;
            case 'Tsunami':
                updatedDisaster = await growRadius(disaster, 50000, 0.15, 2000000);
                break;
            case 'Volcanic Eruption':
                if (Math.random() < 0.1) {
                    disaster.status = 'ended';
                    updatedDisaster = await disaster.save();
                }
                break;
        }

        if (updatedDisaster) {
            io.emit('disaster-update', updatedDisaster.toJSON());
        }
    }
}

function startDisasterEvolution(io) {
    setInterval(() => evolveDisasters(io), 8000);
}

module.exports = { startDisasterEvolution };