const animateCSS = (element, animation, prefix = 'animate__') =>
  new Promise((resolve, reject) => {
    const animationName = `${prefix}${animation}`;
    const node = document.querySelector(element);

    node.classList.add(`${prefix}animated`, animationName);

    function handleAnimationEnd(event) {
      event.stopPropagation();
      node.classList.remove(`${prefix}animated`, animationName);
      resolve('Animation ended');
    }

    node.addEventListener('animationend', handleAnimationEnd, {once: true});
});



class TextScramble {
    constructor(el) {
        this.el = el;
        this.chars = "!<>-_\\/[]{}â€”=+*^?#________";
        this.update = this.update.bind(this);
    }
    setText(newText) {
        const oldText = this.el.innerText;
        const length = Math.max(oldText.length, newText.length);
        const promise = new Promise((resolve) => this.resolve = resolve);
        this.queue = [];
        for (let i = 0; i < length; i++) {
            const from = oldText[i] || "";
            let to = newText[i] || "";
            if (newText.substr(i, 4) === "<br>") {
                to = "<br>";
                i += 3;
            }
            const start = Math.floor(Math.random() * 40);
            const end = start + Math.floor(Math.random() * 40);
            this.queue.push({ from, to, start, end });
        }
        cancelAnimationFrame(this.frameRequest);
        this.frame = 0;
        this.update();
        return promise;
    }
    update() {
    let output = '';
    let complete = 0;
    for (let i = 0, n = this.queue.length; i < n; i++) {
        let { from, to, start, end, char } = this.queue[i];
        if (this.frame >= end) {
            complete++;
            output += to;
        } else if (this.frame >= start) {
            if (!char || Math.random() < 0.28) {
                char = this.randomChar();
                this.queue[i].char = char;
            }
            output += `<span style="color:#ffffff!important;-webkit-background-clip:text!important;background-clip:text!important;">${char}</span>`;
        } else {
            output += from;
        }
    }
    this.el.innerHTML = output;
    if (complete === this.queue.length) {
        this.resolve();
    } else {
        this.frameRequest = requestAnimationFrame(this.update);
        this.frame++;
    }
}


    randomChar() {
        return this.chars[Math.floor(Math.random() * this.chars.length)];
    }
}

const elements = document.querySelectorAll(".scramble");
const frame = document.querySelector(".frame");
const discordframe = document.querySelector(".discordframe");

const button = document.getElementById('playaudio');
const audio = new Audio('../etc/audio.mp3');

button.addEventListener('click', function playAudio() {
    audio.play();
    audio.loop = true;
    button.style.opacity = 0;
    button.removeEventListener('click', playAudio);

    setTimeout(() => {
        button.remove();
    }, 500);

    elements.forEach(async (el) => {
        const fx = new TextScramble(el);
        const phrases = [el.innerText];
        let counter = 0;

        const next = () => {
            let newText = phrases[counter].replace(/\n/g, '<br>');
            return fx.setText(newText);
        }

        await next();
    });

    frame.style.opacity = 1;
    discordframe.style.opacity = 1;
    animateCSS('.frame', 'fadeInDown');
    animateCSS('.discordframe', 'fadeInDown');
});


class Discord {
    constructor(userId) {
        this.userId = userId;
        this.apiUrl = `https://api.lanyard.rest/v1/users/${userId}`;
    }

    async getUserData() {
        const response = await fetch(this.apiUrl);
        const data = await response.json();
        
        return data;
    }
}

document.addEventListener('DOMContentLoaded', fetchUserData);

const colorThief = new ColorThief();

async function fetchUserData() {
    const discord = new Discord('1105349571678318672');
    const data = await discord.getUserData();
    let image, activityname, activitydetails;

    if (!data.data.activities[0].assets) {
        if (data.data.activities[0].name == "SoundCloud") {
            image = `https://cdn.discordapp.com/app-assets/802958833214423081/802962390906830898.png`;
        } else {
            image = `https://cdn.discordapp.com/avatars/${data.data.discord_user.id}/${data.data.discord_user.avatar}.png`;
        }
    } else
        if (data.data.activities == []) {
            image = `https://cdn.discordapp.com/avatars/${data.data.discord_user.id}/${data.data.discord_user.avatar}.png`;
            activityname = `Not doing anything`;
            activitydetails = ``;
        } else {
            if (data.data.activities[0].assets.large_image.includes("spotify")) {
                url = data.data.activities[0].assets.large_image.replace("spotify:", "");
                image = `https://i.scdn.co/image/` + url;
            } else if (data.data.activities[0].assets.large_image.includes("mp:external")) {
                url = data.data.activities[0].assets.large_image.replace("mp:external/", "");
                url = url.split("/https/")[1];
                image = "https://" + url;
            } else {
                image = `https://cdn.discordapp.com/app-assets/${data.data.activities[0].application_id}/${data.data.activities[0].assets.large_image}.png`;
            }
            activityname = data.data.activities[0].name;
            activitydetails = data.data.activities[0].details;
        }

    const activity = document.getElementById("activity");
    const details = document.getElementById("details");
    const imageElement = document.getElementById("image");


    if (activityname) {
        activity.innerHTML = activityname.replace("undefined", "");
    } else {
        activity.innerHTML = "Not doing anything";
    }
    
    if (activitydetails) {
        details.innerHTML = activitydetails.replace("undefined", "");
    } else {
        details.innerHTML = "";
    }
    imageElement.src = image;
    console.log(colorThief.getColor(imageElement));
}


setInterval(() => {
    fetchUserData();
}, 5000);
