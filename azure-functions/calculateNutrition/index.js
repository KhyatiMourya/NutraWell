module.exports = async function (context, req) {
    context.log('Processing nutritional calculations request.');

    const { age, gender, weight, height, activity_level, goal } = req.body || {};

    // 1. Calculate BMI
    let bmi = null;
    let bmiCategory = 'Unknown';
    if (weight && height) {
        const heightM = height / 100;
        bmi = parseFloat((weight / (heightM * heightM)).toFixed(1));
        
        if (bmi < 18.5) bmiCategory = 'Underweight';
        else if (bmi < 25) bmiCategory = 'Normal weight';
        else if (bmi < 30) bmiCategory = 'Overweight';
        else bmiCategory = 'Obese';
    }

    // 2. Calculate BMR (Mifflin-St Jeor)
    let dailyCalorieTarget = 2000;
    if (weight && height && age) {
        let bmr = 0;
        if (gender && gender.toLowerCase() === 'male') {
            bmr = 10 * weight + 6.25 * height - 5 * age + 5;
        } else {
            bmr = 10 * weight + 6.25 * height - 5 * age - 161;
        }

        // Activity Multiplier
        let multiplier = 1.2;
        switch (activity_level && activity_level.toLowerCase()) {
            case 'lightly_active':
                multiplier = 1.375;
                break;
            case 'moderately_active':
                multiplier = 1.55;
                break;
            case 'very_active':
                multiplier = 1.725;
                break;
            case 'sedentary':
            default:
                multiplier = 1.2;
                break;
        }

        let calories = bmr * multiplier;

        // Goal Adjustment
        switch (goal && goal.toLowerCase()) {
            case 'lose_weight':
                calories -= 500;
                break;
            case 'gain_weight':
            case 'gain_muscle':
                calories += 400;
                break;
            case 'maintain':
            default:
                break;
        }

        dailyCalorieTarget = Math.round(Math.max(1200, calories));
    }

    // 3. Return results
    context.res = {
        status: 200,
        headers: {
            'Content-Type': 'application/json'
        },
        body: {
            success: true,
            bmi,
            bmiCategory,
            dailyCalorieTarget,
            macronutrientTargets: {
                carbs_g: Math.round((dailyCalorieTarget * 0.50) / 4), // 50% carbs
                protein_g: Math.round((dailyCalorieTarget * 0.25) / 4), // 25% protein
                fat_g: Math.round((dailyCalorieTarget * 0.25) / 9)    // 25% fats
            }
        }
    };
};
