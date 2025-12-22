const solutions = require("../data/healthSolution");
const professionals = require("../data/professionalsData");

exports.getHealthSolutions = (req,res)=>{
    // console.log(solutions);
    res.status(200).json({solutions:solutions});
}


exports.professionalsData = (req,res)=>{
    // console.log(professionals)
    res.status(200).json({professionals:professionals});
}


