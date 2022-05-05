const poll = async (callback, ms) => {
  let result = await callback();
  while (true) {
    await wait(ms);
    await callback();
  }
};

const wait = (ms) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

const tweetUrl = (visitorCount) => {
  let joinText = "";

  if (visitorCount <= 1) {
    joinText += "i am here alone now.\n";
    joinText += "join me so we can be an us.";
  } else {
    joinText += `there are ${visitorCount} of us here now.\n`;
    joinText += "come join us.";
  }

  const tweetContent = `
hey, look at us.
who would've thought?
${joinText}

https://heylookat.us/
`.trim();
  return encodeURI(`https://twitter.com/intent/tweet?text=${tweetContent}`);
};

const syncWithServer = () => {
  const xhr = new XMLHttpRequest();
  xhr.open("GET", "/count", false);

  let lsClientId = localStorage.getItem("hey_look_at_us_id");

  if (lsClientId) {
    xhr.setRequestHeader("hey-look-at-us-id", lsClientId);
  }

  const result = xhr.send("/count");
  let { clientId, visitorCount } = JSON.parse(xhr.response);

  if (lsClientId === null) {
    localStorage.setItem("hey_look_at_us_id", clientId);
  }

  const countEl = document.getElementById("count");
  const tweetEl = document.getElementById("tweet");

  if (countEl) {
    countEl.innerHTML = visitorCount;
  }
  if (tweetEl) {
    tweetEl.href = tweetUrl(visitorCount);
  }
};

const setupPage = () => {
  syncWithServer();
  poll(syncWithServer, 5000);
};

document.addEventListener("DOMContentLoaded", setupPage);
