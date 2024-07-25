// Define the initial deck and shuffle it
const tempMainDeck = createDeck();
let mainDeck = [];
let card = {};
let holdCardsPC = [];
let holdCardsPlayer = [];
let playerOneTurn = true;
let x = document.getElementById("myAudio");
let originalPositions = {};
let originalTransforms = {};
initOriginalPositions();
let firstCardUp = '';
let secondCardUp = '';
let cardOneUpID = '';
let cardTwoUpID = '';
let cardID;
let playerAlreadyTookCard = false;
let firstRound;
document.getElementById('textMessagesPc').innerText = 'Dublu-Click pe "Joc Nou" pentru a începe!';
document.getElementById('endTurnButton').disabled = true;
document.getElementById('mainDeck').style.visibility = 'hidden';

// Function to create a deck of cards
function createDeck() {
    const DECK = ['1a', '1b', '2a', '2b', '3a', '3b', '4a', '4b', '5a', '5b', '6a', '6b', '7a', '7b', '8a', '8b', '9a', '9b', '10a', '10b', '16h'];
    return DECK;
}

// Function to shuffle adeck deck
function shuffle(deck) {
    for (let i = deck.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    console.log(deck);
}

// Create the main deck by shuffling and creating card objects
function createMainDeck(tempMainDeck) {
    shuffle(tempMainDeck);
    return tempMainDeck.map(str => ({
        name: str,
        fileName: str + '.png',
        type: str.slice(0, -1),
        isUp: false
    }));
}

// Function to clear the text messages appeared on screen:
function clearText(){
    document.getElementById('textMessagesPc').innerText = '';
}

// Function to deal a card from the main deck
function dealCard() {
    if (mainDeck.length === 1){
        document.getElementById('mainDeck').style.visibility = 'hidden';
        return mainDeck.pop();
    } else if (mainDeck.length >1){
        return mainDeck.pop();
    } else {
        return null;
    }
}

// Function to pick a card when clicked
function pickCard(event) {
    const clickedCard = event.target;
    cardID = clickedCard.id;
    const justCardNumber = parseInt(cardID.slice(10));
    translateImage(clickedCard);
}

// Function to draw a card from the main deck
function drawACard() {
    playSound();
    document.getElementById('textMessagesPc').innerText = '';

    if (checkIfPlayerHasMatchingCards()) {
        console.log('Player has matching cards!');
        document.getElementById('textMessagesPc').innerText = 'Trebuie să dai jos perechea!';
        return;
    }

    if (holdCardsPlayer.length >= 10) {
        console.log('Maximum number of cards achieved.');
        return;
    }

    if (playerAlreadyTookCard) {
        document.getElementById('textMessagesPc').innerText = 'Ai tras deja o carte! Dă jos sau termină tura!';
        return;
    }

    let drawnCard = dealCard();
    playerAlreadyTookCard = true;
    holdCardsPlayer.push(drawnCard);

    let numberOfCards = holdCardsPlayer.length;
    let tempCardId = 'playerCard' + numberOfCards;

    document.getElementById(tempCardId).src = 'Images/' + drawnCard.fileName;
    document.getElementById(tempCardId).style.visibility = 'visible';

    if (mainDeck.length === 0) {
        document.getElementById('mainDeck').style.visibility = 'hidden';
        console.log('No more cards in the deck');
        return;
    }
}

// Function to update the two selected card IDs
function updateTheTwoCardsID() {
    if (cardOneUpID === '') {
        cardOneUpID = cardID;
    } else {
        cardTwoUpID = cardID;
    }
}

// Function to translate player's cards
function translateImage(element) {
    let pickedCard = element.id;
    let no = parseInt(pickedCard.slice(10)); // Find out the index of the card in the holdCardsPlayer array
    let currentCard = holdCardsPlayer[no - 1];

    if (!currentCard) {
        console.error(`Card ${no} not found in holdCardsPlayer`);
        return;
    }

    if (currentCard.isUp === false) {
        updateTheTwoCardsID();

       // translate cards different if they are from the left or from the right side:
       if (no % 2 === 0){

        element.style.transform = `translate(10px, -75px)`;
        currentCard.isUp = true;
       } else {
        element.style.transform = `translate(-10px, -75px)`;
        currentCard.isUp = true;
       }

        if (!firstCardUp) {
            firstCardUp = currentCard.type;
        } else {
            secondCardUp = currentCard.type;
            if (!checkMatch()) {
                setTimeout(() => {
                    resetCardPositions();
                }, 500);
            } else {
                document.getElementById('discarded').src = 'Images/' + currentCard.fileName;
                discardPair();
            }
        }
    } else {
        console.log(`Translating card ${pickedCard} down`);
        resetCardPositions();
    }
}

// Function to check if the 2 picked cards are a match
function checkMatch() {
    if (firstCardUp === secondCardUp && firstCardUp !== '') {
        console.log('It\'s a match!!!');
        return true;
    }
    return false;
}

// Function to take a pair out
function discardPair() {
    document.getElementById(cardOneUpID).style.visibility = 'hidden';
    document.getElementById(cardTwoUpID).style.visibility = 'hidden';

    console.log('Cards to be discarded: ' + cardOneUpID + ' ' + cardTwoUpID);

    const nr1 = parseInt(cardOneUpID.slice(10));
    const nr2 = parseInt(cardTwoUpID.slice(10));

    const indicesToRemove = [nr1, nr2].sort((a, b) => b - a);

    indicesToRemove.forEach(index => {
        holdCardsPlayer.splice(index - 1, 1);
    });

    console.log('After removal, remaining cards: ' + holdCardsPlayer);

    holdCardsPlayer.forEach((card, index) => {
        console.log(`Card ${index + 1}: `);
        console.log(card);
    });
    playSound();
    resetPlayerCards();
    resetPCsCards();
    resetCardPositions();
    cardOneUpID = '';
    cardTwoUpID = '';
    isGameOver();
}

// Function to check if the player has matching cards in hand
function checkIfPlayerHasMatchingCards() {
    for (let i = 0; i < holdCardsPlayer.length; i++) {
        let tempCardObject1 = holdCardsPlayer[i];
        let tempCardType1 = tempCardObject1.type;

        for (let j = i + 1; j < holdCardsPlayer.length; j++) {
            let tempCardObject2 = holdCardsPlayer[j];
            let tempCardType2 = tempCardObject2.type;

            if (tempCardType1 === tempCardType2 && i !== j) {
                console.log('Matching cards found at player!');
                return true;
            }
        }
       }

    return false;
}

// Function to initialize original positions
function initOriginalPositions() {
    for (let i = 1; i <= 10; i++) {
        let cardName = 'playerCard' + i;
        let cardElement = document.getElementById(cardName);
        originalPositions[cardName] = cardElement.parentElement;
        originalTransforms[cardName] = cardElement.style.transform || '';
    }
}

// Function to reset original positions and transforms
function resetCardPositions() {
    const tempArray = [9, 7, 5, 3, 1, 2, 4, 6, 8, 10];
    firstCardUp = '';
    secondCardUp = '';
    for (let i of tempArray) {
        let cardName = 'playerCard' + i;
        let cardElement = document.getElementById(cardName);
        let originalParent = originalPositions[cardName];
        if (originalParent && cardElement) {
            originalParent.appendChild(cardElement);
            cardElement.style.transform = originalTransforms[cardName];
        }
    }
    cardOneUpID = '';
    cardTwoUpID = '';

    holdCardsPlayer.forEach(card => {
        card.isUp = false;
    });
}

// Function to clear (make invisible) the discarded cards
function clearDiscarded() {
    document.getElementById('discarded').src = 'Images/empty.png';
}

// Function to deal the first 4 cards when starting the game
function dealFirstCards() {
    document.getElementById('mainDeck').style.visibility = 'visible';
    document.getElementById('textMessagesPc').innerText = '';
    document.getElementById('endTurnButton').disabled = false;
    mainDeck = createMainDeck(tempMainDeck);
    holdCardsPC = [];
    holdCardsPlayer = [];
    playerAlreadyTookCard = false;
    firstRound = true;
    clearDiscarded();
    clearPlayerCards();
    resetPlayerCards();
    resetCardPositions();
    clearDiscarded();
    document.getElementById('mainDeck').style.visibility = 'visible';

    for (let i = 1; i <=4; i++) {
        holdCardsPC.push(dealCard());
        holdCardsPlayer.push(dealCard());
        playSound();
    }
    goPlayer();
}

// Function for the player to play his hand
function goPlayer() {

    console.log('Main deck has now ' + mainDeck.length + ' cards.');

    if (playerOneTurn) {
        if (playerAlreadyTookCard) {
           document.getElementById('textMessagesPc').innerText = 'Ai tras deja o carte; ar trebui să termini tura.';
            return;
        }
        resetPlayerCards();
        resetPCsCards();
    }
}

// Function to end the player's turn (when the button is pressed):
function endPlayersTurn(){
    if (!checkIfPlayerHasMatchingCards() && firstRound && holdCardsPlayer.length >= 4 && !playerAlreadyTookCard){
        document.getElementById('textMessagesPc').innerText = 'Vezi că nu ai tras carte!';
        return;
      }
  // if a card wasn't taken from the deck, error message:
  if (!playerAlreadyTookCard && !firstRound && holdCardsPlayer.length < 10){
    document.getElementById('textMessagesPc').innerText = 'Nu ai tras carte!';
    return;
  }
  
  // if player has matching cards, error message:
  if (checkIfPlayerHasMatchingCards()){
    document.getElementById('textMessagesPc').innerText = 'Vezi că ai perechi în mână!';
    return;
  }
 
  playerOneTurn = false;
  firstRound = false;
  playerAlreadyTookCard = false;

  if (isGameOver() === false){
    // start PC's turn:
    goComputer();
  };
}

// Function to clear the images of the player's cards
function clearPlayerCards() {
    for (let i = 1; i <= 10; i++) {
        let cardName = 'playerCard' + i;
        document.getElementById(cardName).src = 'Images/bkgb.png';
        document.getElementById(cardName).style.visibility = 'hidden';
    }
}

// Function to reset player's cards
function resetPlayerCards() {
    document.getElementById('textMessagesPc').innerText = '';

    clearPlayerCards();
    for (let i = 1; i <= holdCardsPlayer.length; i++) {
        let cardName = 'playerCard' + i;

        if (i <= holdCardsPlayer.length){
            document.getElementById(cardName).src = 'Images/' + holdCardsPlayer[i - 1].name + '.png';
            document.getElementById(cardName).style.visibility = 'visible';
         }
        }
}

// Function to reset the deck image
function resetDeckImages() {
    document.getElementById('mainDeck').style.visibility = mainDeck.length > 0 ? 'visible' : 'hidden';
}

// Function to play audio
function playSound() {
    x.play();
}

// PC functions
// --------------------------------------------------------------------------------------

// Function for computer's turn:
function goComputer(){

    // check if Computer holds any pairs; if not, take a card;
var computerHadPairs = false;

     while (erasePCsTwoMatchingCards() === true) {
     computerHadPairs = true};
    
    if (computerHadPairs === true) {
        document.getElementById('textMessagesPc').innerText = "Adversarul și-a încheiat tura.";
        console.log('Computer turn is over');
        playerOneTurn = true;
        goPlayer();
        return;
    }

   // if first round and computer had pairs, do not pick a card:
   if (firstRound && computerHadPairs) {
    return;
   } else {

    // computer picks a card: 
    
    if (mainDeck.length > 0) {
    holdCardsPC.push(dealCard());
    console.log('Computer just picked a card!');
    document.getElementById('textMessagesPc').innerText = 'Adversarul a tras o carte.';
    resetPCsCards();
       
    // check if any pair was made and discard it:
    erasePCsTwoMatchingCards();

    // end computer's turn :
    if (isGameOver() === false) {
        endComputersTurn();
    } else {
        return;
    };

    } else {
      
    console.log('No more cards in main deck; I should pick from your hand');
    pickCardFromPlayer();
    }
   }
}

// function to end computer's turn:
function endComputersTurn(){
    if (isGameOver() === false){

    playerOneTurn = true;

    console.log('Computer turn is over. Deck has now ' + mainDeck.length + ' cards.');
    setTimeout(() => {
    document.getElementById('textMessagesPc').innerText = "Adversarul și-a terminat tura.";
     }, 1000);
    }
}


// Function to clear the images of the computer's cards
function clearPCsCards() {
    for (let i = 1; i <= 10; i++) {
        let cardName = 'pcCard' + i;
        document.getElementById(cardName).src = 'Images/bkgb.png';
        document.getElementById(cardName).style.visibility = 'hidden';
    }
}

// Function to reset PC's cards
function resetPCsCards() {
    clearPCsCards();
    for (let i = 1; i <= holdCardsPC.length; i++) {

        let cardName = 'pcCard' + i;

        if (i <= holdCardsPC.length){
            document.getElementById(cardName).src = 'Images/bkgb.png';
            document.getElementById(cardName).style.visibility = 'visible';
        }

    }
}

// Function to check if the PC has matching cards
function checkIfPCHasMatchingCards() {
    let computerMatchingCards = [];

    for (let i = 0; i < holdCardsPC.length; i++) {
        let tempCardObject1 = holdCardsPC[i];
        let tempCardType1 = tempCardObject1.type;
       
        for (let j = i + 1; j < holdCardsPC.length; j++) {
            let tempCardObject2 = holdCardsPC[j];
            let tempCardType2 = tempCardObject2.type;
           
            if (tempCardType1 === tempCardType2 && i !== j) {
                computerMatchingCards.push(i);
                computerMatchingCards.push(j);

                console.log('Matching cards found at PC: ' + computerMatchingCards);
               
                document.getElementById('discarded').src = 'Images/' + tempCardObject2.fileName;
                return computerMatchingCards;
            }
        }
    }
    return computerMatchingCards;
}

// Function to erase two matching cards from the computer's hand
function erasePCsTwoMatchingCards() {

    let cardsArray = checkIfPCHasMatchingCards();
    let firstCardIndex;
    let secondCardIndex;

    if (cardsArray.length === 2) {
        firstCardIndex = cardsArray[0];
        secondCardIndex = cardsArray[1];
        holdCardsPC.splice(firstCardIndex, 1);
        holdCardsPC.splice(secondCardIndex - 1, 1);
        console.log('Just deleted two cards!');

        document.getElementById('textMessagesPc').innerText = 'Adversarul a decartat o pereche.';
        playSound();

        resetPCsCards();
        return true;
    } else {

        document.getElementById('textMessagesPc').innerText = 'Adversarul nu are perechi.';
        console.log('Did not find any cards to delete');
        return false;
    }
}

// Function to pick a card fom the PC's hand when clicked:
function pickPCCard(event) {
    const clickedCard = event.target;
    const tempCardID = clickedCard.id;

    const cardIndex = parseInt(tempCardID.slice(6))-1;
    if (mainDeck.length > 0 || playerAlreadyTookCard) {
        return;
    }
    
    if (isNaN(cardIndex) || cardIndex < 0 || cardIndex >= holdCardsPC.length) {
        console.error('Invalid card index:', cardIndex);
        return;
    }

    console.log('You clicked on  ' + holdCardsPC[cardIndex]);

    clickedCard.style.visibility = 'hidden';
    playerAlreadyTookCard = true;
    moveCardToPlayersHand(tempCardID);
}

// function to move the card picked from the computer's hand to the player's hand:
function moveCardToPlayersHand(tempCard){
    if(holdCardsPlayer.length >= 10){
        alert("You can't hold more cards!");
        return;
    }
    
let movedCard = holdCardsPC.splice(parseInt(tempCard.slice(6))-1, 1);
holdCardsPlayer.push(movedCard[0]);

console.log('I have moved this card: ' + movedCard);
console.log(movedCard);
console.log('Player now has ' + holdCardsPlayer.length + ' cards');

resetPlayerCards();

setTimeout(() => {
 resetPCsCards();}, 1000);
}


// function for the computer to pick a card from your hand:
function pickCardFromPlayer(){
    let randomCardIndex = Math.floor(Math.random()*holdCardsPlayer.length);
    let newCard = holdCardsPlayer[randomCardIndex];
    console.log('Computer tries to pick card no ' + newCard + 'from you');
    addCardToPCsHand(newCard);
    // shuffle cards in PCs hand:
    console.log('Shuffle-ing cards in PCs hand:')
    shuffle(holdCardsPC);

    //delete card from player's hand:
    holdCardsPlayer.splice(randomCardIndex,1);
    resetPlayerCards();
    isGameOver();
}

// function to move a card to the computer's hand:
function addCardToPCsHand(newCard){

    holdCardsPC.push(newCard);
    
    document.getElementById('textMessagesPc').innerText = 'Adversarul a tras o carte de la tine.';
    
    resetPCsCards();
       
    // check if any pair made and discard it:
    erasePCsTwoMatchingCards();

    // end computer's turn:
    if (isGameOver() === false){
          
    playerOneTurn = true;
    console.log('Computer turn is over');
    document.getElementById('textMessagesPc').innerText = "Adversarul și-a încheiat tura...";
    }
    }

    // Functiopn to check if the game is over. It return 0 if game not over, 1 if player won and 2 if computer won :
    function isGameOver(){
           
        if (holdCardsPlayer.length === 0 && mainDeck.length === 0) {
            console.log('Game Over! Player has no cards left and deck is empty.');
            document.getElementById('textMessagesPc').innerText = 'Joc terminat. Felicitări, ai câștigat!';
            document.getElementById('endTurnButton').disabled = true;
            // show computer's losing card:
            document.getElementById('pcCard1').src = 'Images/16h.png'
            return true;
        }
    
        if (holdCardsPC.length === 0 && mainDeck.length === 0) {
            console.log('Game Over! PC wins!.');
            document.getElementById('textMessagesPc').innerText = 'Joc terminat. Ai luat bătaie!';
            document.getElementById('endTurnButton').disabled = true;
            return true;
        }
    
        console.log('Game is not over yet.');
        return false;
    }