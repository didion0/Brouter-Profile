let costMake = (unknown, paved = unknown * 0.9, unpaved = unknown * 1.1) => {
  return {
    'paved': paved,
    'unpaved': unpaved,
    'unknown': unknown
  }
};

let costWrite = ({
  paved,
  unpaved,
  unknown
}) => {
  return `switch surface=asphalt|concrete|paved|wood|metal ${paved}
    switch surface=dirt|ground|gravel|fine_gravel|unpaved|grass|compacted|sand|sett|mud ${unpaved} ${unknown}`
};


let bikeTrailCost = costMake(1.05, 1, 1.95);



let bikeLaneCost = {
  'residential': costMake(1.11, 1.1, 3),
  'unclassified': costMake(1.15, 1.12, 3.5),
  'tertiary': costMake(1.5, 1.4, 3.5),
  'secondary': costMake(1.95, 1.9, 3.5),
  'primary': costMake(2.15, 2.1, 3),
  'unknown': costMake(1.85, 1.75, 3.25)
};


// directly based on roadTypeCost
let sharrowCost = {
	'residential': costMake(2, 1.99, 9),
  'unclassified': costMake(2, 1.99, 10),
  'tertiary': costMake(2.8, 2.75, 11),
  'secondary': costMake(10, 9.5, 22),
  'primary': costMake(20, 19, 33),
  'unknown': costMake(70,72,35)
}


let roadTypeCost = {
  'residential': costMake(2.2, 2.15, 9),
  'unclassified': costMake(2.3, 2.22, 10),
  'tertiary': costMake(3.75, 3.5, 11),
  'secondary': costMake(15, 14, 22),
  'primary': costMake(50, 48, 33),
  'motorway': costMake(5000, 5000, 5000),
  'trunk': costMake(5000, 4999, 5000),
  'footway': costMake(40, 23, 75),
  'service': costMake(52, 50, 75),
  'unknown': costMake(75, 72, 35)
}

roadTypeWrite = obj => {
  let writing = '';
  for (let hwyType in obj) {
    let costs = obj[hwyType];
    if (hwyType != "unknown") {
      writing += ` switch highway=${hwyType}${['residential','unclassified','footway','service'].includes(hwyType)?'':"|"+hwyType+"_link"} ${costWrite(costs)}
`
    } else {
      writing += costWrite(costs);
    }
  }
	return writing
}


let unbikableCost = 1000;
let badOneWayCost = 3000;





console.log(`---context:global

assign validForBikes = true
assign validForFoot = false
assign validForCars = false

assign downhillcost = 1
assign downhillcutoff = 2
assign uphillcost = 2
assign uphillcutoff = 2
assign elevationpenaltybuffer = 5
assign elevationmaxbuffer = 10
assign elevationbufferreduce = 0

assign pass1coefficient = 1
assign pass2coefficient = 0

assign turnInstructionMode = 1
assign turnInstructionCatchingRange = 40
assign turnInstructionRoundabouts = true

assign processUnusedTags = false

---context:way

assign turncost = 20
assign initialcost = 0

assign badoneway =
       if reversedirection=yes then
         if oneway:bicycle=yes then true
         else if oneway= then junction=roundabout
         else oneway=yes|true|1
       else oneway=-1
assign disallowed = access=no|private

assign scary_road = highway=trunk|motorway|trunk_link|motorway_link

assign costfactor = 
          	switch or badoneway disallowed 3000 
            switch scary_road 5000
            # Trails Costs
            switch highway=cycleway ${costWrite(bikeTrailCost)}
            
            # Bike Lane Paths Cost
            # CYCLEWAY:BOTH NOT SUPPORTED BY BROUTER D:<
            switch or or cycleway=lane|both|track|yes cycleway:right=lane|track|yes cycleway:left=opposite ${roadTypeWrite(bikeLaneCost)}
            
            # Sharrow Road Discounted Costs
          	switch or cycleway=shared_lane cycleway:right=shared_lane ${roadTypeWrite(sharrowCost)}
            
            # Default Normal Road Costs
          	${roadTypeWrite(roadTypeCost)}

---context:node

assign initialcost = 0`)
