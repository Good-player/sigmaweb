function applyLevelChanges(score) {
    const levelMessage = document.getElementById('levelMessage');
    let message = '';

    // After 15 score
    if (score === 15) {
        message = 'Level Up! Pipes will now move vertically.';
    }

    // After 30 score
    if (score === 30) {
        message = 'Level Up! Introducing special pipes with different colors.';
        // Implement special pipes logic here
    }

    // After 45 score
    if (score === 45) {
        message = 'Level Up! Pipes will now move vertically at a moderate speed.';
    }

    // After 60 score
    if (score === 60) {
        message = 'Level Up! Introducing coins between the pipes for bonus points.';
        // Implement coins logic here
    }

    // After 75 score
    if (score === 75) {
        message = 'Level Up! Pipes will move faster and some pipes may disappear and reappear.';
        // Implement disappearing pipes logic here
    }

    // After 90 score
    if (score === 90) {
        message = 'Level Up! Introducing multiple blocks to control simultaneously.';
        // Implement multiple block logic here
    }

    // After 105 score
    if (score === 105) {
        message = 'Level Up! Special pipes grant extra points or slow down the game temporarily.';
        // Implement special pipes with extra points or slow down logic here
    }

    // After 120 score
    if (score === 120) {
        message = 'Level Up! Pipes will now move vertically at a faster speed.';
    }

    // After 135 score
    if (score === 135) {
        message = 'Level Up! Introducing wind effects that push the block slightly to the left or right.';
        // Implement wind effects logic here
    }

    // After 150 score
    if (score === 150) {
        message = 'Level Up! Pipes will now move vertically even faster.';
    }

    // After 165 score
    if (score === 165) {
        message = 'Level Up! Pipes with different colors that grant extra points or slow down the game temporarily.';
        // Implement special pipes with extra points or slow down logic here
    }

    // After 180 score
    if (score === 180) {
        message = 'Level Up! Multiple blocks to control simultaneously.';
        // Implement multiple block logic here
    }

    // After 195 score
    if (score === 195) {
        message = 'Level Up! Introducing coins between the pipes for bonus points.';
        // Implement coins logic here
    }

    // After 210 score
    if (score === 210) {
        message = 'Level Up! Pipes will move vertically at a faster speed.';
    }

    // After 225 score
    if (score === 225) {
        message = 'Level Up! Introducing disappearing pipes.';
        // Implement disappearing pipes logic here
    }

    // After 240 score
    if (score === 240) {
        message = 'Level Up! Special pipes that grant extra points or slow down the game temporarily.';
        // Implement special pipes with extra points or slow down logic here
    }

    // After 255 score
    if (score === 255) {
        message = 'Level Up! Wind effects will now push the block slightly to the left or right.';
        // Implement wind effects logic here
    }

    // After 270 score
    if (score === 270) {
        message = 'Level Up! Pipes will now move vertically even faster.';
    }

    // After 285 score
    if (score === 285) {
        message = 'Level Up! Multiple blocks to control simultaneously.';
        // Implement multiple block logic here
    }

    // After 300 score
    if (score === 300) {
        message = 'Congratulations! You have mastered the game with a score of 300.';
        // Implement final level logic here
    }

    if (message) {
        levelMessage.innerText = message;
    }
}
