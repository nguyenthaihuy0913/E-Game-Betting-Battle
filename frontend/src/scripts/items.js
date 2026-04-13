const GAME_ITEMS = [
  // Group 1: Attack & Bet Tampering
  { id: 'thief', group: 1, icon: '🧤', name: 'Gold Digger', desc: 'Steal 15 points from 1 targeted team.', needsTarget: true },
  { id: 'tax', group: 1, icon: '🧛‍♂️', name: 'Vampire Bat', desc: 'Drain 10% points from the Top 1 team.' },
  { id: 'snipper', group: 1, icon: '✂️', name: 'Bet Snipper', desc: 'Halve 1 targeted team\'s current bet.', needsTarget: true },
  { id: 'bomb', group: 1, icon: '💣', name: 'Double Jeopardy', desc: 'Force team to lose 2x bet points if answered wrong.', needsTarget: true },
  { id: 'robinhood', group: 1, icon: '🏹', name: 'Robin Hood\'s Arrow', desc: 'Take 10 pts from Top 1 and give to the lowest.' },
  
  // Group 2: UI/UX Troll (Targeted)
  { id: 'freeze', group: 2, icon: '❄️', name: 'Freeze', desc: 'Disable Submit button for 3s.', needsTarget: true },
  { id: 'blur', group: 2, icon: '🌫️', name: 'Blur', desc: 'Blur the question screen for 3s.', needsTarget: true },
  { id: 'brokenkeyboard', group: 2, icon: '⌨️', name: 'Broken Keyboard', desc: 'Disable Backspace/Delete keystrokes.', needsTarget: true },
  { id: 'shuffle', group: 2, icon: '🔀', name: 'Shuffle', desc: 'Randomize A, B, C, D position.', needsTarget: true },
  { id: 'faketypo', group: 2, icon: '🪲', name: 'Fake Typo', desc: 'Periodically injects "@" while typing.', needsTarget: true },
  
  // Group 3: Defense & Dodge
  { id: 'shield', group: 3, icon: '🛡️', name: 'Grammar Shield', desc: 'Blocks 1 incoming targeted attack.' },
  { id: 'mirror', group: 3, icon: '🪞', name: 'Mirror', desc: 'Reflects 1 incoming targeted attack back at sender.' },
  { id: 'safetynet', group: 3, icon: '🛏️', name: 'Safety Net', desc: 'Immune specifically to the Double Jeopardy Bomb.' },
  { id: 'betlock', group: 3, icon: '🔒', name: 'Bet Lock', desc: 'Immune specifically to Bet Snipper.' },
  { id: 'aura', group: 3, icon: '✨', name: 'Aura', desc: 'Provide immunity to all UI/UX Trolls for the round.' },
  
  // Group 4: Buffs & Climbing
  { id: 'fifty', group: 4, icon: '👓', name: '50/50 Glasses', desc: 'Hide 2 guaranteed incorrect options.' },
  { id: 'microscope', group: 4, icon: '🔍', name: 'Microscope', desc: 'Provide a string length mask hint.' },
  { id: 'speedboots', group: 4, icon: '👟', name: 'Speed Boots', desc: 'Deduct 3s from your time for a higher multiplier.' },
  { id: 'multiplier', group: 4, icon: '🚀', name: 'Bonus Multiplier', desc: 'Doubles your total rewarded points if correct.' },
  { id: 'uprising', group: 4, icon: '🚩', name: 'The Uprising', desc: 'Drain 3 pts from every team ranked higher than you.' }
];

const MOCK_TEAMS = ["Team Alphas", "Team Bravo", "Vocab Victors", "Summit Stars", "The Thinkers"];

window.ItemSystem = {
  isActive: false,
  nobackspaceHandler: null,
  faketypoTimeout: null,
  currentItems: [],
  liveTeams: [],

  init: function() {
    window.addEventListener('gameStateUpdate', (e) => {
        this.liveTeams = e.detail.teams || [];
    });
    this.createDrawerUI();
    this.createTriggerButton();
    this.createTargetModal();
    this.createReplacementModal();
  },

  simulateDrop: function() {
    let randItem = GAME_ITEMS[Math.floor(Math.random() * GAME_ITEMS.length)];
    if (this.currentItems.length < 3) {
      this.animateFlyingItem(randItem, () => {
        this.currentItems.push(randItem);
        this.refreshInventoryViews();
        this.showItemToast({icon:'🎁', name:'Item Dropped'}, `You received: ${randItem.name}`);
        if(window.playSuccess) window.playSuccess();
      });
    } else {
      this.openReplacementModal(randItem);
    }
  },

  animateFlyingItem: function(item, callback) {
    const isMobile = window.innerWidth <= 800;
    
    const flyingIcon = document.createElement('div');
    flyingIcon.className = `flying-icon group-${item.group}`;
    flyingIcon.innerHTML = item.icon;
    document.body.appendChild(flyingIcon);

    const startX = window.innerWidth / 2 - 30;
    const startY = window.innerHeight / 2 - 30;
    flyingIcon.style.left = startX + 'px';
    flyingIcon.style.top = startY + 'px';
    
    flyingIcon.offsetHeight;
    
    let targetEl;
    if (isMobile) {
      targetEl = document.querySelector('.item-trigger-btn');
    } else {
      const slots = document.querySelectorAll('.desktop-inv-slot');
      targetEl = slots[this.currentItems.length];
    }

    if (!targetEl) { 
      flyingIcon.remove();
      callback();
      return;
    }

    if(window.playMagic) window.playMagic();

    setTimeout(() => {
      const rect = targetEl.getBoundingClientRect();
      const endX = rect.left + (rect.width / 2) - 30;
      const endY = rect.top + (rect.height / 2) - 30;

      flyingIcon.style.left = endX + 'px';
      flyingIcon.style.top = endY + 'px';
      flyingIcon.style.transform = 'scale(0.3) rotate(360deg)';
      flyingIcon.style.opacity = '0';

      setTimeout(() => {
        targetEl.classList.add('pulse-anim');
        setTimeout(() => targetEl.classList.remove('pulse-anim'), 400);
        flyingIcon.remove();
        callback();
      }, 800); 
    }, 600); 
  },

  refreshInventoryViews: function() {
    // Mobile Drawer View
    const mobileGrid = document.getElementById('inventoryGrid');
    if(mobileGrid) {
      mobileGrid.innerHTML = '';
      if (this.currentItems.length === 0) {
        mobileGrid.innerHTML = '<div style="text-align:center; padding: 20px; font-weight:700; color:#94A3B8;">Inventory Empty!</div>';
      } else {
        this.currentItems.forEach((item, index) => {
          const card = document.createElement('div');
          card.className = `icard group-${item.group}`;
          card.onclick = () => this.onItemClick(item, index);
          card.innerHTML = `
            <div class="icard-icon">${item.icon}</div>
            <div class="icard-content">
              <div class="icard-name">${item.name}</div>
              <div class="icard-desc">${item.desc}</div>
            </div>
          `;
          mobileGrid.appendChild(card);
        });
      }
    }

    // Desktop Persistent View
    const desktopSlots = document.querySelectorAll('.desktop-inv-slot');
    desktopSlots.forEach((slot, index) => {
      slot.innerHTML = '';
      slot.className = 'desktop-inv-slot empty-slot';
      slot.onclick = null;
      slot.removeAttribute('title');
      
      if (index < this.currentItems.length) {
        let item = this.currentItems[index];
        slot.className = `desktop-inv-slot filled-slot group-${item.group}`;
        slot.innerHTML = `<span class="d-icon">${item.icon}</span> <span class="d-name">${item.name}</span>`;
        slot.setAttribute('title', `${item.name}\n${item.desc}`);
        slot.onclick = () => this.onItemClick(item, index);
      } else {
        slot.innerHTML = 'Empty Slot';
      }
    });
  },

  createTriggerButton: function() {
    // Mobile UI Trigger Button
    const btn = document.createElement('button');
    btn.className = 'item-trigger-btn mobile-only';
    btn.innerHTML = '🎒 <span style="font-family:\'Fredoka One\';">Bag</span>';
    btn.onclick = () => this.toggleDrawer();
    document.body.appendChild(btn);
  },

  createDrawerUI: function() {
    const overlay = document.createElement('div');
    overlay.className = 'item-drawer-overlay mobile-only';
    overlay.id = 'itemOverlay';
    overlay.onclick = (e) => {
      if (e.target === overlay) this.toggleDrawer();
    };

    const drawer = document.createElement('div');
    drawer.className = 'item-drawer';
    drawer.id = 'itemDrawer';

    const header = document.createElement('div');
    header.className = 'idrawer-header';
    header.innerHTML = `
      <h3>🎒 Inventory</h3>
      <button onclick="ItemSystem.toggleDrawer()">✖</button>
    `;
    drawer.appendChild(header);

    const grid = document.createElement('div');
    grid.className = 'idrawer-grid';
    grid.id = 'inventoryGrid';

    drawer.appendChild(grid);
    overlay.appendChild(drawer);
    document.body.appendChild(overlay);
  },

  createTargetModal: function() {
    const overlay = document.createElement('div');
    overlay.className = 'target-modal-overlay';
    overlay.id = 'targetOverlay';

    const modal = document.createElement('div');
    modal.className = 'target-modal';
    modal.id = 'targetModal';

    const header = document.createElement('h3');
    header.innerText = '🎯 Choose Target';
    modal.appendChild(header);

    const list = document.createElement('div');
    list.className = 'target-list';
    list.id = 'targetListContainer';
    modal.appendChild(list);

    const cancel = document.createElement('button');
    cancel.className = 'target-cancel';
    cancel.innerText = 'Cancel';
    cancel.onclick = () => this.closeTargetModal();
    modal.appendChild(cancel);

    overlay.appendChild(modal);
    document.body.appendChild(overlay);
  },

  createReplacementModal: function() {
    const overlay = document.createElement('div');
    overlay.className = 'target-modal-overlay';
    overlay.id = 'replaceOverlay';

    const modal = document.createElement('div');
    modal.className = 'target-modal';
    modal.id = 'replaceModal';
    modal.style.maxWidth = "400px";

    const header = document.createElement('h3');
    header.innerText = '⚠️ Inventory Full';
    modal.appendChild(header);
    
    const desc = document.createElement('p');
    desc.style.fontSize = '14px';
    desc.style.color = 'var(--ink3)';
    desc.style.marginBottom = '15px';
    desc.innerText = 'You found a new item! Choose one to discard, or discard the new item.';
    modal.appendChild(desc);

    const newItemWrap = document.createElement('div');
    newItemWrap.id = 'replaceNewItemBox';
    modal.appendChild(newItemWrap);

    const orText = document.createElement('div');
    orText.style.margin = "10px 0";
    orText.style.fontWeight = "800";
    orText.innerText = "Current Items (Click to Replace)";
    modal.appendChild(orText);

    const list = document.createElement('div');
    list.className = 'target-list';
    list.id = 'replaceCurrentList';
    modal.appendChild(list);

    const cancel = document.createElement('button');
    cancel.className = 'target-cancel';
    cancel.style.marginTop = "10px";
    cancel.style.background = "#FFF1F2";
    cancel.style.color = "#E11D48";
    cancel.innerText = 'Discard New Item';
    cancel.onclick = () => this.closeReplacementModal();
    modal.appendChild(cancel);

    overlay.appendChild(modal);
    document.body.appendChild(overlay);
  },

  openReplacementModal: function(newItem) {
    this._newItem = newItem;
    
    // Setup New Item Box
    const newBox = document.getElementById('replaceNewItemBox');
    newBox.innerHTML = `
      <div class="icard group-${newItem.group}" style="border-width: 3px; cursor: default; animation: pulse 2s infinite;">
        <div class="icard-icon">${newItem.icon}</div>
        <div class="icard-content" style="text-align: left;">
          <div class="icard-name">${newItem.name} <span style="font-size:10px; background:var(--coral); color:white; padding:2px 6px; border-radius:4px;">NEW</span></div>
          <div class="icard-desc">${newItem.desc}</div>
        </div>
      </div>
    `;

    // Setup Current List
    const currList = document.getElementById('replaceCurrentList');
    currList.innerHTML = '';
    this.currentItems.forEach((item, index) => {
      const card = document.createElement('div');
      card.className = `icard group-${item.group}`;
      card.style.textAlign = "left";
      card.onclick = () => {
         this.executeReplacement(index);
      };
      card.innerHTML = `
        <div class="icard-icon">${item.icon}</div>
        <div class="icard-content">
          <div class="icard-name">${item.name}</div>
          <div class="icard-desc">${item.desc}</div>
        </div>
      `;
      currList.appendChild(card);
    });

    document.getElementById('replaceOverlay').style.opacity = '1';
    document.getElementById('replaceOverlay').style.pointerEvents = 'auto';
    document.getElementById('replaceModal').style.transform = 'translateY(0) scale(1)';
  },

  executeReplacement: function(index) {
    this.currentItems[index] = this._newItem;
    this.refreshInventoryViews();
    this.closeReplacementModal();
    this.showItemToast({icon:'🔄', name:'Item Replaced'}, `You equipped ${this._newItem.name}!`);
  },

  closeReplacementModal: function() {
    document.getElementById('replaceOverlay').style.opacity = '0';
    document.getElementById('replaceOverlay').style.pointerEvents = 'none';
    document.getElementById('replaceModal').style.transform = 'translateY(20px) scale(0.95)';
  },

  toggleDrawer: function() {
    const overlay = document.getElementById('itemOverlay');
    const drawer = document.getElementById('itemDrawer');
    if (this.isActive) {
      overlay.style.opacity = '0';
      overlay.style.pointerEvents = 'none';
      drawer.style.transform = 'translate(-50%, 100%)';
      this.isActive = false;
    } else {
      overlay.style.opacity = '1';
      overlay.style.pointerEvents = 'auto';
      drawer.style.transform = 'translate(-50%, 0)';
      this.isActive = true;
    }
    if (window.playClick) window.playClick();
  },

  onItemClick: function(item, index) {
    if (item.needsTarget) {
      this._pendingItem = item;
      this._pendingIndex = index;
      
      const list = document.getElementById('targetListContainer');
      list.innerHTML = '';
      
      const myTeam = window.GameClient ? window.GameClient.team : null;
      
      this.liveTeams.forEach(team => {
          if (team.id === myTeam) return; 
          
          let btn = document.createElement('button');
          btn.className = 'target-btn';
          btn.innerText = `Team ${team.id} (${team.score} pts)`;
          btn.onclick = () => {
             this.closeTargetModal();
             this.executeItem(this._pendingItem, team.id, index);
          };
          list.appendChild(btn);
      });
      
      if (list.innerHTML === '') {
          list.innerHTML = `<div style="text-align:center; padding: 10px; color:#94A3B8;">No available targets!</div>`;
      }

      document.getElementById('targetOverlay').style.opacity = '1';
      document.getElementById('targetOverlay').style.pointerEvents = 'auto';
      document.getElementById('targetModal').style.transform = 'translateY(0) scale(1)';
    } else {
      this.executeItem(item, null, index);
    }
  },

  closeTargetModal: function() {
    document.getElementById('targetOverlay').style.opacity = '0';
    document.getElementById('targetOverlay').style.pointerEvents = 'none';
    document.getElementById('targetModal').style.transform = 'translateY(20px) scale(0.95)';
  },

  showItemToast: function(item, extendedMsg = "") {
    const toast = document.getElementById('toast');
    if(!toast) return;
    toast.innerHTML = `<strong>${item.icon} ${item.name}</strong><br>${extendedMsg || item.desc}`;
    toast.className = "toast show";
    setTimeout(() => { toast.className = "toast"; }, 3500);
  },

  showProminentAlert: function(senderName, itemName) {
      const alertBox = document.createElement('div');
      alertBox.style.position = 'fixed';
      alertBox.style.top = '25%';
      alertBox.style.left = '50%';
      alertBox.style.transform = 'translate(-50%, -50%)';
      alertBox.style.backgroundColor = 'rgba(220, 38, 38, 0.95)';
      alertBox.style.color = '#fff';
      alertBox.style.padding = '12px 30px';
      alertBox.style.borderRadius = '50px';
      alertBox.style.fontFamily = "'Fredoka One', cursive";
      alertBox.style.fontSize = '26px';
      alertBox.style.zIndex = '999999';
      alertBox.style.boxShadow = '0 10px 40px rgba(220, 38, 38, 0.4)';
      alertBox.style.textTransform = 'uppercase';
      alertBox.style.pointerEvents = 'none';
      alertBox.innerHTML = `⚠️ ${senderName} USED ${itemName} ON YOU!`;
      
      document.body.appendChild(alertBox);
      
      if (!document.getElementById('prominent-alert-style')) {
          const style = document.createElement('style');
          style.id = 'prominent-alert-style';
          style.innerHTML = `
             @keyframes popInOutAlert {
                 0% { opacity: 0; transform: translate(-50%, -30px) scale(0.8); }
                 15% { opacity: 1; transform: translate(-50%, 0) scale(1.1); }
                 30% { transform: translate(-50%, 0) scale(1); }
                 85% { opacity: 1; transform: translate(-50%, 0) scale(1); }
                 100% { opacity: 0; transform: translate(-50%, -20px) scale(0.9); }
             }
          `;
          document.head.appendChild(style);
      }
      
      alertBox.style.animation = 'popInOutAlert 2.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards';

      setTimeout(() => {
          if (alertBox.parentNode) alertBox.remove();
      }, 2600);
  },

  executeItem: function(item, targetTeamId, index) {
    this.currentItems.splice(index, 1);
    this.refreshInventoryViews();
    if(this.isActive) this.toggleDrawer();

    if (window.GameClient) {
        window.GameClient.useItem(item.id, targetTeamId);
    }

    if (item.group === 1 && window.playSteal) window.playSteal();
    else if (item.group === 2 && item.id === 'blackout' && window.playBlackout) window.playBlackout();
    else if (item.group === 2 && window.playFreeze) window.playFreeze();
    else if (window.playMagic) window.playMagic();

    let targetMsg = targetTeamId ? ` against Team ${targetTeamId}` : "";
    this.showItemToast(item, `Used ${item.name}${targetMsg}!`);
    
    // Self-buff items can just apply instantly locally 
    if (item.group === 4 && ['fifty', 'microscope'].includes(item.id)) {
        this.applyEffects(item);
    }
  },

  receiveItemEffect: function(data) {
      const myTeam = window.GameClient ? window.GameClient.team : null;
      const fullItem = GAME_ITEMS.find(i => i.id === data.item);
      if (!fullItem) return;

      const senderName = data.team ? `Team ${data.team}` : "Someone";
      
      if (data.blocked) {
          if (data.target === myTeam) {
               this.showItemToast({ icon: '🛡️', name: 'Shield Active' }, `Blocked ${fullItem.name} from ${senderName}!`);
          } else if (data.team === myTeam) {
               this.showItemToast({ icon: '🧊', name: 'Attack Blocked' }, `Your attack was blocked by Team ${data.target}!`);
          }
          return;
      }

      if (data.reflected) {
          if (data.team === myTeam) {
               this.showItemToast({ icon: '🪞', name: 'Reflected!' }, `Oh no! Your ${fullItem.name} was reflected back at you!`);
               this.applyEffects(fullItem); 
          } else if (data.originalTarget === myTeam) {
               this.showItemToast({ icon: '🪞', name: 'Mirror Active' }, `Reflected ${fullItem.name} back to ${senderName}!`);
          }
          return;
      }

      if (data.target === myTeam) {
          this.showProminentAlert(senderName, fullItem.name);
          this.showItemToast({ icon: '⚠️', name: 'Incoming Attack' }, `${senderName} hit you with ${fullItem.name}!`);
          
          // Auto-block if Aura is active and it's a UI troll
          if (fullItem.group === 2) {
             const teamDetails = this.liveTeams.find(t => t.id === myTeam);
             if (teamDetails && teamDetails.hasAura) {
                 this.showItemToast({ icon: '✨', name: 'Aura Active' }, `Purified UI Troll from ${senderName}!`);
                 return;
             }
          }
          
          this.applyEffects(fullItem);
      } else if (!data.target) {
          // Global effect
          this.showItemToast({ icon: '⚠️', name: 'Item Alert' }, `${senderName} used ${fullItem.name}!`);
      }
  },

  applyEffects: function(item) {
    // UI Effects
    switch(item.id) {
      case 'freeze':
        this.showItemToast(item, `Submit button disabled for 3s!`);
        this.freezeSubmitButton(3000);
        break;

      case 'blur':
        this.showItemToast(item, `Screen blurred for 3s!`);
        document.querySelector('.test-container').style.filter = "blur(8px)";
        setTimeout(() => { document.querySelector('.test-container').style.filter = "none"; }, 3000);
        break;

      case 'brokenkeyboard':
        this.showItemToast(item, `Backspace/Delete disabled!`);
        if(!this.nobackspaceHandler) {
          this.nobackspaceHandler = function(e) {
            if (e.key === 'Backspace' || e.key === 'Delete') {
              e.preventDefault();
              let toast = document.getElementById('toast');
              toast.innerText = "❌ Backspace is disabled!";
              toast.className = "toast show";
              setTimeout(() => { toast.className = "toast"; }, 1500);
            }
          };
          window.addEventListener('keydown', this.nobackspaceHandler);
        }
        break;

      case 'shuffle':
        this.showItemToast(item, "Options shuffled!");
        const grid = document.getElementById('options-grid');
        if(grid) {
          Array.from(grid.children).forEach(child => {
            child.style.order = Math.floor(Math.random() * 10);
          });
        }
        break;
        
      case 'faketypo':
        this.showItemToast(item, "Fake Bug applied (wait 2s)!");
        const gapInput = document.querySelector('.gap-fill-input');
        if(gapInput) {
          this.faketypoTimeout = setTimeout(() => {
            gapInput.value = gapInput.value + "@";
          }, 2000);
        }
        break;

      case 'fifty':
        this.showItemToast(item, "Removed 2 wrong options!");
        this.mock5050();
        break;
        
      case 'microscope':
        this.showItemToast(item, "Hint given!");
        const input2 = document.querySelector('.gap-fill-input');
        if(input2) input2.placeholder = "E _ _ _ _ _ _ _ _ _";
        break;
    }
  },

  freezeSubmitButton: function(durationMs) {
    const mcqContainer = document.getElementById('options-grid');
    if (mcqContainer) {
      mcqContainer.style.pointerEvents = 'none';
      mcqContainer.style.opacity = '0.5';
      setTimeout(() => {
        mcqContainer.style.pointerEvents = 'auto';
        mcqContainer.style.opacity = '1';
      }, durationMs);
    }
    
    const gapFillInput = document.querySelector('.gap-fill-input');
    if (gapFillInput) {
      gapFillInput.disabled = true;
      setTimeout(() => {
        gapFillInput.disabled = false;
        gapFillInput.focus();
      }, durationMs);
    }
  },

  mock5050: function() {
    const grid = document.getElementById('options-grid');
    if (!grid) return; 
    const btns = grid.querySelectorAll('.opt-btn');
    if (btns.length >= 4) {
      btns[1].style.opacity = '0';
      btns[1].style.pointerEvents = 'none';
      btns[3].style.opacity = '0';
      btns[3].style.pointerEvents = 'none';
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
      ItemSystem.init();
    }, 300);
});
