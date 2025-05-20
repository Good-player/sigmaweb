// --- Data and Helpers ---
function printOutput(html) {
    const term = document.getElementById('terminal');
    term.innerHTML += html + '<br>';
    term.scrollTop = term.scrollHeight;
}
function escapeHtml(str) {
    return (str||'').replace(/[&<>"']/g, function(m) {
        return ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
        })[m];
    });
}
function getRandomElement(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}
function getComInfo() {
    let cores = navigator.hardwareConcurrency || '?';
    let platform = navigator.platform || '?';
    let lang = navigator.language;
    let screenRes = `${window.screen.width}x${window.screen.height}`;
    let browser = navigator.userAgent;
    let timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    let memory = navigator.deviceMemory ? navigator.deviceMemory + ' GB' : '?';
    let host = window.location.hostname;
    let logicalDrives = "Not available in browser";
    let battery = "Not available in browser";
    let os = (navigator.userAgentData && navigator.userAgentData.platform) ? navigator.userAgentData.platform : platform;

    return `
        <div class='cmd-info'><b>System Information</b> <span class='cmd-badge'>/cominfo</span></div>
        <table class="cmd-table">
            <tr><th>CPU Cores</th><td>${cores}</td><th>RAM (est.)</th><td>${memory}</td></tr>
            <tr><th>OS/Platform</th><td>${os}</td><th>Browser UA</th><td>${browser}</td></tr>
            <tr><th>Screen Res</th><td>${screenRes}</td><th>Language</th><td>${lang}</td></tr>
            <tr><th>Timezone</th><td>${timeZone}</td><th>Hostname</th><td>${host}</td></tr>
            <tr><th>Logical Drives</th><td>${logicalDrives}</td><th>Battery</th><td>${battery}</td></tr>
        </table>
    `;
}

// --- Permission-Control State ---
let awaitingPermission = false;
let permissionCommand = null;
let permissionArgs = null;
let permissionResolver = null;

// --- Command Definitions ---
const commands = [
    {
        name: '/help',
        desc: 'List all commands and their descriptions.',
        params: [],
        action: function() {
            let msg = "<div class='cmd-info'><b>Available Commands:</b><ul>";
            for (let cmd of commands) {
                msg += `<li><b>${cmd.name}</b>: ${cmd.desc}</li>`;
            }
            msg += "</ul></div>";
            printOutput(msg);
        }
    },
    {name: '/back', desc: 'Redirect to hub.html.', params: [], action: () => {
        printOutput("<div class='cmd-info'>Redirecting to hub.html ...</div>");
        setTimeout(() => window.location.href = "hub.html", 800);
    }},
    {name: '/cominfo', desc: 'Display browser/device info (CPU, RAM, OS, screen, etc).', params: [], action: () => printOutput(getComInfo())},
    {name: '/clear', desc: 'Clear the terminal.', params: [], action: () => { document.getElementById('terminal').innerHTML = ''; }},

    // Featureful and non-boring commands:
    {name: '/print', desc: 'Prints input text. Usage: /print (text)', params: [{name:'text',type:'text',prompt:'Enter text to print'}], action: args => {
        let msg = args.join(' '); printOutput(`<div class='cmd-success'>${escapeHtml(msg)}</div>`);
    }},
    {name: '/confirm', desc: 'Confirm (true|false). Usage: /confirm (true|false)', params: [{name:'confirm',type:'boolean',values:['true','false']}], action: args => {
        let val = args[0]; printOutput(`<div class='cmd-info'>Confirm result: <b>${escapeHtml(val)}</b></div>`);
    }},
    {name: '/theme', desc: 'Set theme: dark, light, or system. Usage: /theme (dark|light|system)', params: [{name:'theme',type:'enum',values:['dark','light','system']}], action: args => {
        let val = (args[0]||'').toLowerCase();
        if(val==='dark'){document.body.style.background='#181818';document.body.style.color='#f2f2f2';printOutput("<div class='cmd-success'>Theme: dark.</div>");}
        else if(val==='light'){document.body.style.background='#fff';document.body.style.color='#222';printOutput("<div class='cmd-success'>Theme: light.</div>");}
        else{document.body.style.background='';document.body.style.color='';printOutput("<div class='cmd-success'>Theme: system default.</div>");}
    }},
    {name: '/case', desc: 'Change case. Usage: /case (upper|lower) (text)', params: [{name:'type',type:'enum',values:['upper','lower']},{name:'text',type:'text'}], action: args => {
        let type=args[0],txt=args.slice(1).join(' ');
        printOutput(`<div class='cmd-success'>${type==='upper'?escapeHtml(txt.toUpperCase()):escapeHtml(txt.toLowerCase())}</div>`);
    }},
    {name: '/palindrome', desc: 'Palindrome check. Usage: /palindrome (text)', params: [{name:'text',type:'text',prompt:'Enter text'}], action: args => {
        let txt=args.join('').replace(/[^a-zA-Z0-9]/g,'').toLowerCase();
        let isPal=txt===txt.split('').reverse().join('');
        printOutput(`<div class='cmd-${isPal?'success':'error'}'>${isPal?"It's a palindrome!":"Not a palindrome."}</div>`);
    }},
    {name: '/echo', desc: 'Echo your input. Usage: /echo (text)', params: [{name:'text',type:'text',prompt:'Enter text to echo'}], action: args => {
        let msg=args.join(' '); printOutput(`<div class='cmd-output'>${escapeHtml(msg)}</div>`);
    }},
    {name: '/reverse', desc: 'Reverse the text. Usage: /reverse (text)', params: [{name:'text',type:'text',prompt:'Enter text to reverse'}], action: args => {
        let txt=args.join(' '); printOutput(`<div class='cmd-success'>${escapeHtml(txt.split('').reverse().join(''))}</div>`);
    }},
    // Modern commands:
    {name: '/uuid', desc: 'Generate a UUID v4.', params: [], action: () => {
        let uuid=([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g,c=>(c^crypto.getRandomValues(new Uint8Array(1))[0]&15>>c/4).toString(16));
        printOutput(`<div class='cmd-success'>UUIDv4: <b>${uuid}</b></div>`);
    }},
    {name: '/password', desc: 'Generate strong password: /password (length)', params:[{name:'length',type:'number',prompt:'Length (6-64)'}], action: args=>{
        let len=parseInt(args[0])||12;if(len<6||len>64)len=12;
        let chars="abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=~",pass="";
        for(let i=0;i<len;i++)pass+=chars[Math.floor(Math.random()*chars.length)];
        printOutput(`<div class='cmd-success'>Password: <b>${pass}</b></div>`);
    }},
    {name: '/qr', desc:'QR for text/URL: /qr (text)', params:[{name:'text',type:'text',prompt:'Enter text for QR'}], action: args=>{
        let txt=args.join(' ');let url="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data="+encodeURIComponent(txt);
        printOutput(`<div class='cmd-info'>QR for "${escapeHtml(txt)}":<br><img src="${url}" alt="qr"></div>`);
    }},
    {name:'/roll',desc:'Roll dice: /roll (sides)',params:[{name:'sides',type:'number',prompt:'Sides'}],action:args=>{
        let sides=parseInt(args[0])||20;if(sides<2||sides>100)sides=20;
        let n=Math.floor(Math.random()*sides)+1;
        printOutput(`<div class='cmd-success'>🎲 Rolled: <b>${n}</b> (1-${sides})</div>`);
    }},
    {name:'/len',desc:'Length of text: /len (text)',params:[{name:'text',type:'text',prompt:'Enter text'}],action:args=>{
        let txt=args.join(' ');printOutput(`<div class='cmd-info'>Length: <b>${txt.length}</b></div>`);
    }},
    {name:'/date',desc:'Show the date.',params:[],action:()=>{printOutput(`<div class='cmd-info'>${(new Date()).toLocaleDateString()}</div>`);}},
    {name:'/time',desc:'Show the time.',params:[],action:()=>{printOutput(`<div class='cmd-info'>${(new Date()).toLocaleTimeString()}</div>`);}},
    {name:'/fortune',desc:'Random fortune.',params:[],action:()=>{let f=["You will find what you seek.","A thrilling time is in your immediate future.","Now is the time to try something new.","Hard work pays off.","A pleasant surprise is waiting.","Don’t just think, act!"];printOutput(`<div class='cmd-info'>🥠 <b>${getRandomElement(f)}</b></div>`);}},
    {name:'/joke',desc:'Random joke.',params:[],action:()=>{let j=["Why do programmers prefer dark mode? Because light attracts bugs!","Why did the computer go to the doctor? It had a virus.","Why do Java devs wear glasses? They don’t see sharp.","Why did the developer go broke? Used up all his cache."];printOutput(`<div class='cmd-info'>😂 <b>${getRandomElement(j)}</b></div>`);}},
    {name:'/tab',desc:'Open a URL in new tab: /tab (url)',params:[{name:'url',type:'text',prompt:'Enter URL'}],action:args=>{
        let url=args.join(' ');if(!url.match(/^https?:\/\//))url="https://"+url;
        window.open(url,'_blank');printOutput(`<div class='cmd-info'>Opened <b>${escapeHtml(url)}</b> in new tab.</div>`);
    }},
    // Permission-aware command example (copy)
    {name:'/copy',desc:'Copy text to clipboard. Usage: /copy (text)',params:[{name:'text',type:'text',prompt:'Text to copy'}],action:args=>{
        let txt = args.join(' ');
        tryClipboardWrite(txt);
    }},
    {name:'/ascii',desc:'Cool ASCII art! /ascii (cat|dog|fish|robot)',params:[{name:'art',type:'enum',values:['cat','dog','fish','robot']}],action:args=>{
        let ascii={cat:`=^.^=`,dog:`U·ᴥ·U`,fish:`><(((º>`,robot:`[◉_◉]`};let key=args[0]||'cat';
        printOutput(`<div class='cmd-success'><pre>${ascii[key]||ascii['cat']}</pre></div>`);
    }},
    // Cancel and retry (permission flow)
    {name:'/retry',desc:'Retry the last permission command.',params:[],action:()=>{
        if(!awaitingPermission) {
            printOutput(`<div class='cmd-warning'>Nothing to retry.</div>`);
            return;
        }
        printOutput(`<div class='cmd-info'>Retrying permission request...</div>`);
        if(permissionResolver) permissionResolver('retry');
    }},
    {name:'/cancel',desc:'Cancel current permission command.',params:[],action:()=>{
        if(!awaitingPermission) {
            printOutput(`<div class='cmd-warning'>Nothing to cancel.</div>`);
            return;
        }
        printOutput(`<div class='cmd-warning'>Permission command cancelled.</div>`);
        if(permissionResolver) permissionResolver('cancel');
    }},
];

// --- Permission Handling ---
function tryClipboardWrite(txt) {
    if (!navigator.clipboard) {
        printOutput(`<div class='cmd-error'>Clipboard API not supported in your browser.</div>`);
        return;
    }
    navigator.clipboard.writeText(txt).then(() => {
        printOutput(`<div class='cmd-success'>Copied to clipboard!</div>`);
    }).catch(() => {
        startPermissionFlow('/copy', [txt], () => tryClipboardWrite(txt));
    });
}
function startPermissionFlow(cmd, args, retryFn) {
    awaitingPermission = true;
    permissionCommand = cmd;
    permissionArgs = args;
    printOutput(`<div class='cmd-warning'>
        You need to grant permission for this command.<br>
        Please allow permission in your browser popup.<br>
        Then type <b>/retry</b> to try again, or <b>/cancel</b> to abort.<br>
        <span style="color:#888;">No other commands are available until you finish this step.</span>
        </div>`);
    // Wait for /retry or /cancel
    return new Promise(resolve => {
        permissionResolver = (action) => {
            if(action==='retry') {
                awaitingPermission = false;
                permissionResolver = null;
                retryFn();
            } else if(action==='cancel') {
                awaitingPermission = false;
                permissionResolver = null;
                printOutput(`<div class='cmd-info'>Permission command cancelled.</div>`);
            }
        };
    });
}

// --- Autocomplete logic ---
const input = document.getElementById('cmdInput');
const autocomplete = document.getElementById('cmd-autocomplete-list');
let autocompleteVisible = false;
let autocompleteItems = [];
let autocompleteSelected = 0;
let currentParamMode = false;
let currentCommand = null;
let currentParamIndex = 0;
let paramArgs = [];

function showAutocomplete(prefix) {
    let val = prefix.trim();
    if (!val) { hideAutocomplete(); return; }
    autocompleteItems = commands.filter(c => c.name.startsWith(val));
    if (autocompleteItems.length === 0) { hideAutocomplete(); return; }
    let html = "";
    autocompleteItems.forEach((cmd, i) => {
        let usageDesc = '';
        if (cmd.params.length > 0)
            usageDesc = cmd.desc.match(/\(.*\)/) ? `<span class="cmd-param-suggest">${cmd.desc.match(/\(.*\)/)[0]}</span>` : '';
        html += `<div class="cmd-autocomplete-item${i===0?' selected':''}" data-index="${i}">${cmd.name} <span style="color:#888;">- ${cmd.desc}</span>${usageDesc}</div>`;
    });
    autocomplete.innerHTML = html;
    autocomplete.style.display = "block";
    autocompleteVisible = true;
    autocompleteSelected = 0;
    autocomplete.style.left = 0;
    autocomplete.style.top = "100%";
    autocomplete.style.width = "100%";
}
function hideAutocomplete() {
    autocomplete.style.display = "none";
    autocompleteVisible = false;
}
function updateAutocompleteSelection(dir) {
    if (!autocompleteVisible) return;
    let max = autocompleteItems.length - 1;
    autocompleteSelected += dir;
    if (autocompleteSelected < 0) autocompleteSelected = max;
    if (autocompleteSelected > max) autocompleteSelected = 0;
    let items = autocomplete.querySelectorAll('.cmd-autocomplete-item');
    items.forEach(i => i.classList.remove('selected'));
    items[autocompleteSelected].classList.add('selected');
    let sel = items[autocompleteSelected];
    if (sel) sel.scrollIntoView({block: "nearest", behavior: "smooth"});
}
function applyAutocomplete() {
    if (!autocompleteVisible) return;
    input.value = autocompleteItems[autocompleteSelected].name + ' ';
    hideAutocomplete();
    input.focus();
}

function showParamPrompt(cmdObj, paramIdx) {
    let param = cmdObj.params[paramIdx];
    let promptArea = document.getElementById('cmd-param-prompt');
    if (promptArea) promptArea.remove();
    let parent = input.parentElement;
    let chipHTML = '';
    if (param.type === 'boolean' || (param.type === 'enum' && param.values)) {
        chipHTML = param.values.map((v,i)=>`<span class="cmd-param-chip${i===0?' selected':''}" data-index="${i}">${v}</span>`).join('');
    }
    let node = document.createElement('div');
    node.id = 'cmd-param-prompt';
    node.innerHTML = `
      <div style="background:#232323;border:1px solid #333;color:#ffe042;padding:5px 13px;border-radius:5px;min-width:120px;white-space:nowrap;z-index:22;">
      ${param.prompt||'Choose value:'} 
      ${chipHTML}
      </div>
    `;
    parent.appendChild(node);
    node.style.left = "0";
    node.style.top = "100%";
    node.style.minWidth = "180px";
    node.style.width = "auto";
    node.style.background = "transparent";
    node.style.position = "absolute";
    node.style.marginTop = "6px";
    node.style.zIndex = "22";
    if (chipHTML) {
        let chips = node.querySelectorAll('.cmd-param-chip');
        let chipSelected = 0;
        chips.forEach((chip, idx) => {
            chip.onclick = () => {
                chips.forEach(c=>c.classList.remove('selected'));
                chip.classList.add('selected');
                chipSelected = idx;
                input.value = input.value.replace(/\s+\S*$/,'') + ' ' + chip.textContent;
                input.focus();
            };
        });
        input.onkeydown = function(e){
            if (e.key === 'ArrowRight') {
                chipSelected = (chipSelected+1)%chips.length;
                chips.forEach((c,i)=>c.classList.toggle('selected', chipSelected===i));
                e.preventDefault();
            } else if (e.key === 'ArrowLeft') {
                chipSelected = (chipSelected-1+chips.length)%chips.length;
                chips.forEach((c,i)=>c.classList.toggle('selected', chipSelected===i));
                e.preventDefault();
            } else if (e.key === 'Enter') {
                chips[chipSelected].click();
                e.preventDefault();
            }
        };
    }
}
function hideParamPrompt() {
    let promptArea = document.getElementById('cmd-param-prompt');
    if (promptArea) promptArea.remove();
    input.onkeydown = null;
}

// --- Editor-like navigation (arrow keys move terminal view) ---
const terminal = document.getElementById('terminal');
document.addEventListener('keydown', function(e) {
    if (document.activeElement !== input) {
        if (e.key === "ArrowDown") {
            terminal.scrollTop += 32;
        } else if (e.key === "ArrowUp") {
            terminal.scrollTop -= 32;
        } else if (e.key === "ArrowPageDown" || e.key === "PageDown") {
            terminal.scrollTop += terminal.clientHeight;
        } else if (e.key === "ArrowPageUp" || e.key === "PageUp") {
            terminal.scrollTop -= terminal.clientHeight;
        }
    }
});

// --- Input events ---
input.addEventListener('input', function(e) {
    // Remove any newlines: force single line
    this.value = this.value.replace(/\n/g, "");
    if (!currentParamMode && !awaitingPermission) showAutocomplete(this.value);
    if (currentParamMode && currentCommand && currentCommand.params && currentParamIndex < currentCommand.params.length) {
        let param = currentCommand.params[currentParamIndex];
        if (param.type === 'boolean' || (param.type === 'enum' && param.values)) showParamPrompt(currentCommand, currentParamIndex);
        else hideParamPrompt();
    }
});
input.addEventListener('keydown', function(e) {
    if (awaitingPermission) {
        // Only allow /retry and /cancel
        if (e.key === 'Enter') {
            e.preventDefault();
            let val = this.value.trim();
            if (val === '/retry' && permissionResolver) {
                permissionResolver('retry');
                this.value = '';
            } else if (val === '/cancel' && permissionResolver) {
                permissionResolver('cancel');
                this.value = '';
            } else if (val !== '') {
                printOutput(`<div class='cmd-error'>Only /retry or /cancel allowed while waiting for permission.</div>`);
            }
        }
        return;
    }
    if (currentParamMode) {
        let param = currentCommand.params[currentParamIndex];
        if ((param.type === 'boolean' || (param.type === 'enum' && param.values)) && (e.key === 'Tab' || e.key === 'ArrowRight' || e.key === 'ArrowLeft')) return;
        if (e.key === 'Enter') {
            let tokens = input.value.trim().split(/\s+/);
            if (tokens.length <= currentParamIndex+1) return;
            paramArgs.push(tokens[currentParamIndex+1]);
            currentParamIndex++;
            hideParamPrompt();
            if (currentParamIndex < currentCommand.params.length) {
                showParamPrompt(currentCommand, currentParamIndex);
            } else {
                currentParamMode = false;
                let displayCmd = `${currentCommand.name} ${paramArgs.map(v=>`(${escapeHtml(v)})`).join(' ')}`;
                printOutput(`<span style="color:#42c9ff;">&gt; ${displayCmd}</span>`);
                currentCommand.action(paramArgs);
                input.value = '';
                paramArgs = [];
                currentCommand = null;
                currentParamIndex = 0;
            }
            e.preventDefault();
            return;
        }
        return;
    }
    if (autocompleteVisible && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
        e.preventDefault();
        updateAutocompleteSelection(e.key === 'ArrowDown' ? 1 : -1);
        return;
    }
    if (autocompleteVisible && e.key === 'Tab') {
        e.preventDefault();
        applyAutocomplete();
        return;
    }
    if (e.key === 'Enter') {
        e.preventDefault();
        let val = this.value.trim();
        if (!val) return;
        let [cmd, ...args] = val.split(/\s+/);
        let found = commands.find(c => c.name === cmd);
        if (found && found.params && found.params.length > 0 && args.length < found.params.length) {
            currentParamMode = true;
            currentCommand = found;
            currentParamIndex = args.length;
            paramArgs = args;
            showParamPrompt(found, currentParamIndex);
            return;
        }
        printOutput(`<span style="color:#42c9ff;">&gt; ${escapeHtml(val)}</span>`);
        handleCommand(val);
        this.value = '';
        hideAutocomplete();
    }
});
autocomplete.addEventListener('mousedown', function(e) {
    let item = e.target.closest('.cmd-autocomplete-item');
    if (!item) return;
    autocompleteSelected = parseInt(item.dataset.index);
    applyAutocomplete();
});

function handleCommand(inputStr) {
    let [cmd, ...args] = inputStr.split(/\s+/);
    let found = commands.find(c => c.name === cmd);
    if (awaitingPermission) {
        // Only /retry and /cancel allowed!
        if (cmd === '/retry' && permissionResolver) permissionResolver('retry');
        else if (cmd === '/cancel' && permissionResolver) permissionResolver('cancel');
        else printOutput(`<div class='cmd-error'>Only /retry or /cancel allowed while waiting for permission.</div>`);
        return;
    }
    if (found) found.action(args);
    else printOutput(`<div class='cmd-error'>Unknown command: <b>${escapeHtml(cmd)}</b> (type /help)</div>`);
}

printOutput("<div class='cmd-info'>Welcome to the Command Line! Type <b>/help</b> for available commands.<br>Scroll for history. Sigmaweb 2026, All right reserved.</div>");
