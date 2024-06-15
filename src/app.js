import { strictRules, botDesc } from "./prompts";

const inputField = document.getElementById("inputField");
const sendButton = document.querySelector("button");
const AvatarSelector = document.getElementsByTagName("template")[0];
const favoriteSection = document.getElementById("favorite_section");
const loadingScreen = document.getElementById("loadingScreen");

let sentPrompts = [];
let lastResponse = [];

const CallingAPI = async () => {
  let botAssigments = [
    {
      role: "assistant",
      content: strictRules,
    },
    {
      role: "assistant",
      content: botDesc,
    },
  ];
  console.log("userprompts: ", sentPrompts);
  const userInput = sentPrompts.slice(-6);
  let concatenatedPrompts = [...botAssigments, ...userInput];
  const RequestMessage = concatenatedPrompts.slice(0, 8);
  console.log("usermsg: ", userInput);
  console.log("newmsg: ", RequestMessage);

  let raw = JSON.stringify({
    model: "gpt-3.5-turbo",
    messages: RequestMessage,
    max_tokens: 550,
    temperature: 1,
  });
  let requestOptions = {
    method: "POST",
    headers: {
      Authorization: "Bearer ", //insert bearer token here
      "Content-Type": "application/json",
    },
    body: raw,
    redirect: "follow",
  };
  const FetchAPI = await fetch(
    "https://api.openai.com/v1/chat/completions", //openai api url
    requestOptions
  );
  const convertingResponseToText = await FetchAPI.text();
  lastResponse = convertingResponseToText;
  LaunchAPP.BotResponse(lastResponse);
};

class RequestAndResponse {
  constructor(role, text, pointerEvent, bgColor) {
    this.role = role;
    this.text = text;
    this.pointerEvent = pointerEvent;
    this.bgColor = bgColor;
  }

  FieldMaker(userBoxDIV, contentArea, newPromptField) {
    const userAvatar = AvatarSelector.content
      .querySelector(`.${this.role}`)
      .cloneNode(true);
    userBoxDIV.append(userAvatar);
    userBoxDIV.append(newPromptField);
    contentArea.append(userBoxDIV);
    newPromptField.scrollIntoView();
    sendButton.style.pointerEvents = this.pointerEvent;
    inputField.style.backgroundColor = this.bgColor;
  }

  definer() {
    const FavoriteRecipesAdd = new FavoriteRecipes();
    const contentArea = document.getElementById("contentBox");
    const userBoxDIV = document.createElement("div");
    userBoxDIV.id = "userBOX";
    const newPromptField = document.createElement("div");
    newPromptField.id = `container_${this.role}`;
    if (this.role == "user") {
      newPromptField.innerText = this.text;
      userBoxDIV.style.flexDirection = "row-reverse";
      sentPrompts.push({
        role: "user",
        content: `Siz: ${inputField.value}`,
      });
      CallingAPI();
    } else {
      newPromptField.innerHTML = `<img id="favbuton" src="img/heart.png">${this.text}`;
      newPromptField.firstChild.addEventListener(
        "click",
        FavoriteRecipesAdd.favoriteAdd
      );
      sentPrompts.push({
        role: "assistant",
        content: `${JSON.parse(lastResponse).choices[0].message.content}`,
      });
      inputField.value = "";
    }
    this.FieldMaker(userBoxDIV, contentArea, newPromptField);
  }
}

class FavoriteRecipes {
  favoriteDB_Maker(prompt, randomID) {
    localStorage.setItem(randomID, prompt);
  }

  favoriteDB_delete(recipeID) {
    localStorage.removeItem(recipeID);
  }

  favoriteDelete = () => {
    const selectAllDeleteButtons = document.querySelectorAll("#deleteButtons");
    const deleteButton = (e) => {
      const deleteButtonRemover = e.target.parentNode.parentNode.parentNode;
      const recipeID = deleteButtonRemover.className;
      this.favoriteDB_delete(recipeID);
      deleteButtonRemover.remove();
    };
    for (let whichButton of selectAllDeleteButtons) {
      whichButton.addEventListener("click", deleteButton);
    }
  };

  favoriteAdd = (e) => {
    const text = e.target.parentNode;
    const randomID = Math.floor(Math.random() * 100000 + 1);
    this.favoriteDB_Maker(text.innerText, randomID);
    text.className = randomID;
    this.favoriteFieldMaker(randomID);
  };

  favoriteFieldMaker(key) {
    const createBox = document.createElement("div");
    createBox.id = "favorite_box";
    createBox.className = key;
    const recipeText = localStorage.getItem(key);
    createBox.innerHTML = `
    <div class="favoriteFlex">
    <div class="textoverflow">${recipeText}</div>
    <div class="favsectionbuttons">
    <img width="15px" height="15px" id="deleteButtons" src="img/delete.svg">
    <img width="15px" height="15px" id="zoomin" src="img/zoom.svg">
    </div>
    </div>`;
    favoriteSection.append(createBox);
    ShowFullRecipe.showRecipe();
    this.favoriteDelete();
  }
}

class ShowFullRecipe {
  static showRecipe = () => {
    const selectAllFavorites = document.querySelectorAll("#zoomin");
    const fullReviewer = document.getElementById('favoriteRecipe_full');
    const recipeText = document.getElementById('textarea');
    const closeButton = document.getElementById("closeButton");

    const fullRecipe = (e) => {
      const base = e.target.parentNode.parentNode;
      recipeText.innerText = base.innerText;
      fullReviewer.style.display = 'block';
    };
    for (let whichFav of selectAllFavorites) {
      whichFav.addEventListener("click", fullRecipe);
    }
    closeButton.addEventListener("click", () => {fullReviewer.style.display = 'none';});
  };
}

class LaunchAPP {
  static requestToBot() {
    const requestToBot = new RequestAndResponse(
      "user",
      `Siz: ${inputField.value}`,
      "none",
      "gray"
    );
    requestToBot.definer();
    loadingScreen.style.display = 'block';
  }
  static BotResponse(lastResponse) {
    const responseFromBot = new RequestAndResponse(
      "bot",
      `${JSON.parse(lastResponse).choices[0].message.content}`,
      "auto",
      "white"
    );
    responseFromBot.definer();
    loadingScreen.style.display = 'none';
  }
}

class App {
  constructor() {
    sendButton.addEventListener("click", LaunchAPP.requestToBot);
    sendButton.addEventListener("keypress", (e) => { if(e.key === "Enter"){ LaunchAPP.requestToBot }})
    const FavoriteFieldMaker = new FavoriteRecipes();
    let storageItems = { ...localStorage };
    let key = Object.keys(storageItems);
    for (key in storageItems) {
      FavoriteFieldMaker.favoriteFieldMaker(key);
    } 

  }
}

new App();
