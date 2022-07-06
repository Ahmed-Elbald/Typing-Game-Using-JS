// Getting frequently used elements
const levelsBtns = document.querySelectorAll(".level-choosing > button")
const startBtn = document.querySelector(".start-btn");
const timeLeftSpan = document.querySelector(".stat > .time-left > span");
const finalScoreBox = document.querySelector(".final-score");
const input = document.getElementById("input");
const wordToWrite = document.querySelector(".word-to-write > span");
const wordsContainer = document.querySelector(".words-container");

// Precluding the user from pasting anything into the input field
input.addEventListener("paste", (event) => event.preventDefault())

// Global
let level = "";
const wordsNum = [10, 20, 30];
const wordsArr = []


// One of the levels buttons got clicked
levelsBtns.forEach((element) => {
  element.addEventListener("click", () => {
    level = element.dataset.level;

    // Using the level to get and set some varibles that will be global
    timeLeft = level == "easy" ? 5 : level == "normal" ? 4 : 3;
    wordsNumIndex = level == "easy" ? 0 : level == "normal" ? 1 : 2;
    wordToWrite.textContent = "";
    reset()
    words = getWords()
    addWords()
  });
});

// The start button got clicked
startBtn.addEventListener("click", () => {
  if (level != "") {
    document.getElementById("input").focus();
    reset()
    addWords()
    manageGame(counter = 0)
  }
})


function reset() {

  // Setting the default values of the level and updating elements' styles
  timeLeftSpan.textContent = timeLeft;
  timeLeftSpan.style.color = "aquamarine";
  finalScoreBox.textContent = "";
  input.value = "";
  finalScoreBox.style.color = "aquamarine"
  document.querySelector(".level-par > span.level").textContent = level;
  document.querySelector(".level-par > span.seconds").textContent = timeLeft;
  document.querySelector(".stat > .score > span.words-number").textContent = wordsNum[wordsNumIndex];
  document.querySelector(".stat .words-passed").innerHTML = 0;
}

function getWords() {
  let file = level == "easy" ? "file_easy.txt" : "file.txt";
  let dictionaryWords = level == "easy" ? 1000 : 10000;
  let request = fetch(file).then(
    (file) => file.text().then(
      (text) => {

        // Putting together all the words in the file into one array
        let word = "";
        for (x of text) {
          if (x == ",") {
            wordsArr.push(word);
            word = "";
            continue;
          }
          word += x
        }
        return wordsArr
      }
    ).then((wordsArr) => {

      // Choosing random words from the array
      let finalArr = []
      for (let i = 0; i < wordsNum[wordsNumIndex]; i++) {
        let target = Math.trunc(Math.random() * dictionaryWords);
        finalArr.push(wordsArr[target])
      }
      return finalArr;
    }));
  return request
}


function addWords() {

  // Removing the children of the element to put new ones
  if (wordsContainer.children) {
    for (let x of wordsContainer.children) {
      x.style.opacity = "0";
    }
    setTimeout(() => {
      wordsContainer.innerHTML = "";
    }, 300)
  }

  // Making a new span to contain the word
  let newWord = document.createElement("span");

  // Making a document fragment to contain the span(s)
  let fragment = document.createDocumentFragment();
  setTimeout(() => {
    words.then(
      (words) => {

        // Adding the span(s) into the fragment
        for (x of words) {
          let newWordCloned = newWord.cloneNode();
          newWordCloned.textContent = x;
          fragment.appendChild(newWordCloned)
        }

        // Adding the fragment into the element
        wordsContainer.appendChild(fragment)
      }
    );
  }, 300)
}

function manageGame(counter) {

  // Resetting the defaul time of the level
  timeLeftSpan.textContent = timeLeft;

  // Resetting the defaul word the user will write
  words.then((x) => wordToWrite.textContent = x[counter])
  let id = setInterval(() => {

    // If one of the level buttons got clicked while the game is running,
    // Clear the Interval => To break the current game
    for (x of levelsBtns) {
      x.addEventListener("click", () => clearInterval(id))
    }
    timeLeftSpan.textContent--;

    // Time out
    if (timeLeftSpan.textContent == 0) {

      // The user fucked up
      if (input.value != wordToWrite.textContent.toLowerCase()) {
        timeLeftSpan.style.color = "indianred";
        finalScoreBox.style.color = "indianred"
        finalScoreBox.textContent = "You have lost the game";
        counter++

        // The user typed the word properly
      } else {
        timeLeftSpan.textContent = timeLeft;
        counter++

        // Updating the word and the input field
        words.then((x) => wordToWrite.textContent = x[counter])
        input.value = "";

        // Removing the old word from the box of words
        wordsContainer.removeChild(wordsContainer.firstElementChild);
        document.querySelector(".stat .words-passed").innerHTML = counter;
        words.then((n) => {

          // If it's the last word then the user has won
          if (n[counter] == undefined) {
            finalScoreBox.textContent = "congrats !! You have won"
            clearInterval(id);

          } else {
            manageGame(counter)
          }
        })
      }
      clearInterval(id)
    }
  }, 1000)
}