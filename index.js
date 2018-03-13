const statusCodes = {};

function setStatusCode(tabId) {
  let statusCode = statusCodes[tabId];
  if (!statusCode) {
    browser.browserAction.setBadgeText({ text: '' });
    return;
  }

  browser.tabs.query({ currentWindow: true, active: true }).then(tabs => {
    if (tabs[0].id !== tabId) {
      return;
    }

    browser.browserAction.setBadgeText({ text: statusCode.toString() });
    browser.browserAction.setBadgeBackgroundColor({
      color: getStatusCodeColor(statusCode)
    });
  });
}

function getStatusCodeColor(x) {
  switch (true) {
    case x < 200:
      return 'blue';
      break;
    case x >= 200 && x < 300:
      return 'darkgreen';
      break;
    case x >= 300 && x < 400:
      return 'purple';
      break;
    case x >= 400 && x < 500:
      return 'chocolate';
      break;
    default:
      return 'red';
      break;
  }
}

browser.webRequest.onCompleted.addListener(
  e => {
    if (e.tabId === -1 || e.type !== 'main_frame') {
      return;
    }

    statusCodes[e.tabId] = e.statusCode;
    browser.browserAction.setTitle({ tabId: e.tabId, title: e.statusLine });
    setStatusCode(e.tabId);
  },
  { urls: ['<all_urls>'] }
);

browser.webNavigation.onCommitted.addListener(e => {
  if (e.frameId === 0) {
    setStatusCode(e.tabId);
  }
});

browser.tabs.onActivated.addListener(e => {
  setStatusCode(e.tabId);
});

browser.tabs.onRemoved.addListener(tabId => {
  statusCodes[tabId] = null;
});
