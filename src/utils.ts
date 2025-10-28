export function formatScore(score:number){
    const scoreAsText = score.toString();
    let zerosToAdd = 0;
    let nbDigits = 6;
    if(scoreAsText.length < nbDigits){
        zerosToAdd = nbDigits - scoreAsText.length;
    }
    let zeros= "";
    for (let i = 0; i < zerosToAdd; i++) {
        zeros += "0";
    }

    return zeros + scoreAsText;
}