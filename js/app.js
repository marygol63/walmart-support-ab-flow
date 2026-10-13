/**
 * ==========================================================================
 * WALMART MOBILE UX A/B USABILITY TESTING PROTOTYPE - APPLICATION LOGIC
 * Course: MMDD 231 – Contemporary Web Design 2
 * Student: Maryam Nazargol
 * ==========================================================================
 */

(function () {
  'use strict';

  // Prototype State Model
  const state = {
    currentFlow: 'A', // 'A' (Order-first) or 'B' (Support-first)
    activeScreenId: 'screen-home',
    navigationHistory: [],
    selectedOrder: {
      id: '2000112233445',
      name: 'Dream On Me Synergy MOD 4-in-1 Convertible Crib - White',
      shortName: 'Dream On Me Synergy MOD Crib',
      price: '$129.00',
      date: 'Delivered Oct 2, 2026',
      image: 'assets/images/crib.jpg',
      status: 'Delivered'
    },
    selectedIssue: 'Damaged item',
    queueWaitTime: '8 minutes',
    queuePosition: 3,
    isFluidView: false
  };

  // DOM Elements
  const landingScreen = document.getElementById('landingScreen');
  const simulatorWrapper = document.getElementById('simulatorWrapper');
  const phoneFrame = document.getElementById('phoneFrame');
  const screenViewport = document.getElementById('screenViewport');
  const toastElement = document.getElementById('wmToast');
  const bottomSheetBackdrop = document.getElementById('bottomSheetBackdrop');
  const bottomSheetTitle = document.getElementById('sheetTitle');
  const bottomSheetBody = document.getElementById('sheetBody');
  const scenarioModal = document.getElementById('scenarioModal');

  // Researcher Toolbar Controls
  const btnFlowA = document.getElementById('btnFlowA');
  const btnFlowB = document.getElementById('btnFlowB');
  const btnResetFlow = document.getElementById('btnResetFlow');
  const btnExitToHub = document.getElementById('btnExitToHub');
  const btnToggleDevice = document.getElementById('btnToggleDevice');
  const btnViewScenario = document.getElementById('btnViewScenario');
  const activeFlowLabel = document.getElementById('activeFlowLabel');

  // Bottom Navigation Bar
  const mainBottomNav = document.getElementById('mainBottomNav');
  const navTabs = document.querySelectorAll('.nav-tab');

  /**
   * Show Toast Notification
   */
  function showToast(message, iconSvg) {
    if (!toastElement) return;
    const toastIcon = toastElement.querySelector('.toast-icon');
    const toastMsg = toastElement.querySelector('.toast-msg');
    
    if (toastIcon && iconSvg) toastIcon.innerHTML = iconSvg;
    if (toastMsg) toastMsg.textContent = message;

    toastElement.classList.add('visible');
    clearTimeout(toastElement._timer);
    toastElement._timer = setTimeout(() => {
      toastElement.classList.remove('visible');
    }, 2800);
  }

  /**
   * Open Believable Bottom Sheet Modal for Secondary Actions
   */
  function openBottomSheet(title, bodyHtml) {
    if (!bottomSheetBackdrop) return;
    if (bottomSheetTitle) bottomSheetTitle.textContent = title;
    if (bottomSheetBody) bottomSheetBody.innerHTML = bodyHtml;
    bottomSheetBackdrop.classList.add('visible');
  }

  function closeBottomSheet() {
    if (bottomSheetBackdrop) {
      bottomSheetBackdrop.classList.remove('visible');
    }
  }

  /**
   * Navigate to a Target Screen
   */
  function navigateTo(screenId, pushHistory = true) {
    const currentScreen = document.getElementById(state.activeScreenId);
    const targetScreen = document.getElementById(screenId);

    if (!targetScreen) {
      console.warn(`Screen with ID "${screenId}" not found.`);
      return;
    }

    if (pushHistory && state.activeScreenId && state.activeScreenId !== screenId) {
      state.navigationHistory.push(state.activeScreenId);
    }

    // Hide all screens
    document.querySelectorAll('.view-screen').forEach(scr => {
      scr.classList.remove('active');
    });

    // Show target screen
    targetScreen.classList.add('active');
    state.activeScreenId = screenId;

    // Reset viewport scroll to top
    if (screenViewport) {
      screenViewport.scrollTop = 0;
    }

    // Handle Bottom Navigation Visibility
    // Hide bottom nav on Queue and detailed Handoff/Connection endpoints
    if (mainBottomNav) {
      if (screenId === 'screen-queue' || screenId === 'screen-handoff-a' || screenId === 'screen-order-connected') {
        mainBottomNav.style.display = 'none';
      } else {
        mainBottomNav.style.display = 'flex';
      }

      // Update active nav tab highlight
      navTabs.forEach(tab => tab.classList.remove('active'));
      if (screenId === 'screen-home') {
        const homeTab = document.getElementById('navTabShop');
        if (homeTab) homeTab.classList.add('active');
      } else if (screenId.includes('account') || screenId.includes('orders') || screenId.includes('order-details')) {
        const accountTab = document.getElementById('navTabAccount');
        if (accountTab) accountTab.classList.add('active');
      }
    }
  }

  /**
   * Go Back in Navigation History
   */
  function goBack() {
    if (state.navigationHistory.length > 0) {
      const prevScreenId = state.navigationHistory.pop();
      navigateTo(prevScreenId, false);
    } else {
      // Default fallback
      navigateTo('screen-home', false);
    }
  }

  /**
   * Launch Flow from Landing Screen
   */
  function launchFlow(flowType) {
    state.currentFlow = flowType;
    state.navigationHistory = [];

    // Update Toolbar state
    if (activeFlowLabel) {
      activeFlowLabel.textContent = flowType === 'A' ? 'Flow A (Order-First)' : 'Flow B (Support-First)';
    }

    if (btnFlowA && btnFlowB) {
      btnFlowA.classList.toggle('active', flowType === 'A');
      btnFlowB.classList.toggle('active', flowType === 'B');
    }

    // Hide Landing Screen, show Simulator
    if (landingScreen) landingScreen.style.display = 'none';
    if (simulatorWrapper) simulatorWrapper.classList.add('active');

    // Both flows begin at the exact same shared Home screen!
    navigateTo('screen-home', false);
  }

  /**
   * Return to Landing Hub
   */
  function exitToLandingHub() {
    state.navigationHistory = [];
    if (simulatorWrapper) simulatorWrapper.classList.remove('active');
    if (landingScreen) {
      landingScreen.style.display = 'block';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  /**
   * Reset the Current Flow to Shared Home Screen
   */
  function resetCurrentFlow() {
    state.navigationHistory = [];
    navigateTo('screen-home', false);
    showToast('Reset to Home Screen');
  }

  /**
   * Toggle Fluid / Phone Frame
   */
  function toggleFluidView() {
    state.isFluidView = !state.isFluidView;
    if (phoneFrame) {
      phoneFrame.classList.toggle('fluid-view', state.isFluidView);
    }
    if (btnToggleDevice) {
      btnToggleDevice.textContent = state.isFluidView ? '📱 Phone Frame' : '🖥️ Responsive View';
    }
  }

  /**
   * Bind Flow-Specific Interactive Handlers
   */
  function bindInteractions() {
    // -------------------------------------------------------------
    // Landing Page Buttons
    // -------------------------------------------------------------
    const btnLaunchA = document.getElementById('btnLaunchFlowA');
    const btnLaunchB = document.getElementById('btnLaunchFlowB');
    if (btnLaunchA) btnLaunchA.addEventListener('click', () => launchFlow('A'));
    if (btnLaunchB) btnLaunchB.addEventListener('click', () => launchFlow('B'));

    const choiceCardA = document.getElementById('choiceCardA');
    const choiceCardB = document.getElementById('choiceCardB');
    if (choiceCardA) choiceCardA.addEventListener('click', () => launchFlow('A'));
    if (choiceCardB) choiceCardB.addEventListener('click', () => launchFlow('B'));

    // -------------------------------------------------------------
    // Top Researcher Controls
    // -------------------------------------------------------------
    if (btnFlowA) btnFlowA.addEventListener('click', () => launchFlow('A'));
    if (btnFlowB) btnFlowB.addEventListener('click', () => launchFlow('B'));
    if (btnResetFlow) btnResetFlow.addEventListener('click', resetCurrentFlow);
    if (btnExitToHub) btnExitToHub.addEventListener('click', exitToLandingHub);
    if (btnToggleDevice) btnToggleDevice.addEventListener('click', toggleFluidView);

    if (btnViewScenario && scenarioModal) {
      btnViewScenario.addEventListener('click', () => {
        scenarioModal.classList.add('active');
      });
      const btnCloseScenario = document.getElementById('btnCloseScenario');
      if (btnCloseScenario) {
        btnCloseScenario.addEventListener('click', () => {
          scenarioModal.classList.remove('active');
        });
      }
      scenarioModal.addEventListener('click', (e) => {
        if (e.target === scenarioModal) scenarioModal.classList.remove('active');
      });
    }

    // -------------------------------------------------------------
    // Global Back Buttons
    // -------------------------------------------------------------
    document.querySelectorAll('.btn-nav-back').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        goBack();
      });
    });

    // -------------------------------------------------------------
    // Bottom Navigation Tabs
    // -------------------------------------------------------------
    const navTabShop = document.getElementById('navTabShop');
    const navTabAccount = document.getElementById('navTabAccount');
    const navTabItems = document.getElementById('navTabItems');
    const navTabSparky = document.getElementById('navTabSparky');
    const navTabSavings = document.getElementById('navTabSavings');

    if (navTabShop) {
      navTabShop.addEventListener('click', () => navigateTo('screen-home'));
    }

    if (navTabAccount) {
      navTabAccount.addEventListener('click', () => {
        // Direct to appropriate account view depending on active flow
        if (state.currentFlow === 'A') {
          navigateTo('screen-account-a');
        } else {
          navigateTo('screen-account-b');
        }
      });
    }

    if (navTabItems) {
      navTabItems.addEventListener('click', () => showToast('My Items saved list is empty'));
    }
    if (navTabSparky) {
      navTabSparky.addEventListener('click', () => showToast('Sparky AI Assistant active'));
    }
    if (navTabSavings) {
      navTabSavings.addEventListener('click', () => showToast('Viewing Rollback Savings'));
    }

    // -------------------------------------------------------------
    // Shared Home Screen (A0 / B0)
    // -------------------------------------------------------------
    // Top Bar Account Greeting Click
    const headerGreeting = document.getElementById('headerGreeting');
    if (headerGreeting) {
      headerGreeting.addEventListener('click', () => {
        if (state.currentFlow === 'A') {
          navigateTo('screen-account-a');
        } else {
          navigateTo('screen-account-b');
        }
      });
    }

    // Rollback hero banner click
    const heroRollback = document.getElementById('heroRollback');
    if (heroRollback) {
      heroRollback.addEventListener('click', () => showToast('Rollback Sale: DeLonghi Espresso Machine'));
    }

    // -------------------------------------------------------------
    // FLOW A: ORDER-FIRST PATH
    // -------------------------------------------------------------
    
    // A1 Account Screen -> Orders Row
    const rowOrdersA = document.getElementById('rowOrdersA');
    if (rowOrdersA) {
      rowOrdersA.addEventListener('click', () => navigateTo('screen-orders-history'));
    }

    // Wallet row secondary action
    const rowWalletA = document.getElementById('rowWalletA');
    if (rowWalletA) {
      rowWalletA.addEventListener('click', () => {
        openBottomSheet('Walmart Wallet', '<p>Walmart Rewards Mastercard: <strong>$45.20</strong> bonus balance available.</p><p style="margin-top:8px">Default payment: Visa ending in 4092</p>');
      });
    }

    // A2 Purchase History -> Target Crib Order Click
    const targetOrderCardA = document.getElementById('targetOrderCardA');
    if (targetOrderCardA) {
      targetOrderCardA.addEventListener('click', () => navigateTo('screen-order-details'));
    }

    // Secondary non-target orders in history
    const orderCardGame = document.getElementById('orderCardGame');
    if (orderCardGame) {
      orderCardGame.addEventListener('click', () => {
        openBottomSheet('Order #2000112233001', '<p><strong>Hasbro Family Board Game Collection</strong></p><p>Delivered on Sep 21, 2026</p><p style="margin-top:8px;color:#2A8703">Delivered to Front Door • $46.27</p>');
      });
    }

    const orderCardGroceries = document.getElementById('orderCardGroceries');
    if (orderCardGroceries) {
      orderCardGroceries.addEventListener('click', () => {
        openBottomSheet('Order #2000112231940', '<p><strong>Great Value Breakfast Cereal & Organic Pantry Bundle</strong></p><p>Delivered on Sep 10, 2026</p><p style="margin-top:8px;color:#2A8703">Delivered • $18.96</p>');
      });
    }

    // Filter pills
    document.querySelectorAll('.filter-tab-pill').forEach(pill => {
      pill.addEventListener('click', function () {
        document.querySelectorAll('.filter-tab-pill').forEach(p => p.classList.remove('active'));
        this.classList.add('active');
        showToast(`Showing: ${this.textContent}`);
      });
    });

    // A3 Order Details Screen -> Actions
    const btnGetHelpWithItem = document.getElementById('btnGetHelpWithItem');
    if (btnGetHelpWithItem) {
      btnGetHelpWithItem.addEventListener('click', () => navigateTo('screen-help-with-order'));
    }

    const btnTrackShipment = document.getElementById('btnTrackShipment');
    if (btnTrackShipment) {
      btnTrackShipment.addEventListener('click', () => {
        openBottomSheet('Shipment Tracking', '<p style="color:#2A8703;font-weight:700">Delivered on Friday, Oct 2, 2026 at 2:14 PM</p><p style="margin-top:8px">Carrier: Walmart Delivery Fleet</p><p>Tracking #: WM-CA-88941092</p><p style="margin-top:8px">Left at porch/front entrance.</p>');
      });
    }

    const btnReturnReplace = document.getElementById('btnReturnReplace');
    if (btnReturnReplace) {
      btnReturnReplace.addEventListener('click', () => {
        openBottomSheet('Returns & Replacements', '<p>This item is eligible for standard return or replacement until <strong>Nov 2, 2026</strong>.</p><p style="margin-top:10px">Need direct assistance with an issue? Use <strong>Get help with this item</strong> below.</p>');
      });
    }

    const btnViewReceipt = document.getElementById('btnViewReceipt');
    if (btnViewReceipt) {
      btnViewReceipt.addEventListener('click', () => {
        openBottomSheet('Electronic Receipt', '<p>Order #2000112233445</p><p>Subtotal: $129.00</p><p>HST (13%): $16.77</p><p><strong>Total Paid: $145.77</strong></p><p style="font-size:12px;color:#74767B;margin-top:8px">Payment: Visa ending in 4092</p>');
      });
    }

    const btnAddToCart = document.getElementById('btnAddToCart');
    if (btnAddToCart) {
      btnAddToCart.addEventListener('click', () => showToast('Added to Cart (1 item)'));
    }

    const btnBuyAgain = document.getElementById('btnBuyAgain');
    if (btnBuyAgain) {
      btnBuyAgain.addEventListener('click', () => showToast('Added to Cart (1 item)'));
    }

    // A4 Help with this order -> Damaged Item Selection
    const optionDamagedItemA = document.getElementById('optionDamagedItemA');
    if (optionDamagedItemA) {
      optionDamagedItemA.addEventListener('click', () => {
        document.querySelectorAll('#screen-help-with-order .issue-choice-option').forEach(opt => opt.classList.remove('selected'));
        optionDamagedItemA.classList.add('selected');
        state.selectedIssue = 'Damaged item';
        setTimeout(() => {
          navigateTo('screen-handoff-a');
        }, 220);
      });
    }

    // Other issue choices
    document.querySelectorAll('#screen-help-with-order .issue-choice-option').forEach(opt => {
      if (opt !== optionDamagedItemA) {
        opt.addEventListener('click', function () {
          document.querySelectorAll('#screen-help-with-order .issue-choice-option').forEach(o => o.classList.remove('selected'));
          this.classList.add('selected');
          const issueLabel = this.querySelector('.issue-radio-label span')?.textContent || 'Support';
          state.selectedIssue = issueLabel;
          setTimeout(() => {
            navigateTo('screen-handoff-a');
          }, 220);
        });
      }
    });

    // A5 Support Handoff -> Chat With Us Channel
    const btnChannelChatA = document.getElementById('btnChannelChatA');
    if (btnChannelChatA) {
      btnChannelChatA.addEventListener('click', () => navigateTo('screen-queue'));
    }

    const btnChannelCallA = document.getElementById('btnChannelCallA');
    if (btnChannelCallA) {
      btnChannelCallA.addEventListener('click', () => {
        openBottomSheet('Phone Support', '<p>Walmart Customer Care: <strong>1-800-328-0402</strong></p><p style="margin-top:8px">Current phone wait time is approximately 5–10 minutes.</p>');
      });
    }

    // -------------------------------------------------------------
    // FLOW B: SUPPORT-FIRST PATH
    // -------------------------------------------------------------

    // B1 / B2 Account Lower Entry -> Help Centre Row
    const rowHelpCentreB = document.getElementById('rowHelpCentreB');
    if (rowHelpCentreB) {
      rowHelpCentreB.addEventListener('click', () => navigateTo('screen-help-centre'));
    }

    // B3 Help Centre Screen -> Contact Us Card
    const btnHelpContactUs = document.getElementById('btnHelpContactUs');
    if (btnHelpContactUs) {
      btnHelpContactUs.addEventListener('click', () => navigateTo('screen-choose-issue'));
    }

    // Popular help topics
    document.querySelectorAll('.topic-row').forEach(row => {
      row.addEventListener('click', () => navigateTo('screen-choose-issue'));
    });

    // B4 Choose Issue Screen -> Damaged Item Card
    const cardIssueDamaged = document.getElementById('cardIssueDamaged');
    if (cardIssueDamaged) {
      cardIssueDamaged.addEventListener('click', () => {
        state.selectedIssue = 'Damaged item';
        navigateTo('screen-choose-order');
      });
    }

    // Other issue cards in B4
    document.querySelectorAll('#screen-choose-issue .issue-nav-card').forEach(card => {
      if (card !== cardIssueDamaged) {
        card.addEventListener('click', function () {
          const title = this.querySelector('.issue-title-text')?.textContent || 'Support';
          state.selectedIssue = title;
          navigateTo('screen-choose-order');
        });
      }
    });

    // B5 Choose Which Order Screen -> Order Selection & Continue
    const orderSelectCrib = document.getElementById('orderSelectCrib');
    const orderSelectGroceries = document.getElementById('orderSelectGroceries');
    const orderSelectDiapers = document.getElementById('orderSelectDiapers');
    const btnContinueB = document.getElementById('btnContinueB');

    const orderCardsB = [orderSelectCrib, orderSelectGroceries, orderSelectDiapers].filter(Boolean);

    orderCardsB.forEach(card => {
      card.addEventListener('click', function () {
        orderCardsB.forEach(c => c.classList.remove('selected'));
        this.classList.add('selected');
        const radio = this.querySelector('input[type="radio"]');
        if (radio) radio.checked = true;
      });
    });

    if (btnContinueB) {
      btnContinueB.addEventListener('click', () => {
        navigateTo('screen-order-connected');
      });
    }

    // B6 Order Connected Screen -> Chat with Agent
    const btnChatWithAgentB = document.getElementById('btnChatWithAgentB');
    if (btnChatWithAgentB) {
      btnChatWithAgentB.addEventListener('click', () => navigateTo('screen-queue'));
    }

    const editIssueLinkB = document.getElementById('editIssueLinkB');
    if (editIssueLinkB) {
      editIssueLinkB.addEventListener('click', () => navigateTo('screen-choose-issue'));
    }

    // -------------------------------------------------------------
    // SHARED END SCREEN: JOIN QUEUE (A6 & B7)
    // -------------------------------------------------------------
    const btnLeaveQueue = document.getElementById('btnLeaveQueue');
    const btnCloseQueue = document.getElementById('btnCloseQueue');

    function handleLeaveQueue() {
      openBottomSheet(
        'Leave Live Support Queue?',
        '<p>Are you sure you want to leave the queue? You will lose your spot (Position #3) with the live agent.</p><div style="display:flex;gap:10px;margin-top:16px"><button id="btnConfirmLeaveQueue" style="flex:1;background:#D9381E;color:#fff;border:none;padding:10px;border-radius:20px;font-weight:700;cursor:pointer">Yes, Leave Queue</button><button id="btnCancelLeaveQueue" style="flex:1;background:#E3E5E8;color:#2E2F32;border:none;padding:10px;border-radius:20px;font-weight:700;cursor:pointer">Stay in Line</button></div>'
      );

      setTimeout(() => {
        const btnConfirm = document.getElementById('btnConfirmLeaveQueue');
        const btnCancel = document.getElementById('btnCancelLeaveQueue');
        if (btnConfirm) {
          btnConfirm.addEventListener('click', () => {
            closeBottomSheet();
            showToast('You have left the queue');
            navigateTo('screen-home');
          });
        }
        if (btnCancel) {
          btnCancel.addEventListener('click', () => {
            closeBottomSheet();
          });
        }
      }, 50);
    }

    if (btnLeaveQueue) btnLeaveQueue.addEventListener('click', handleLeaveQueue);
    if (btnCloseQueue) btnCloseQueue.addEventListener('click', handleLeaveQueue);

    // Bottom sheet close
    const btnCloseSheet = document.getElementById('btnCloseSheet');
    if (btnCloseSheet) btnCloseSheet.addEventListener('click', closeBottomSheet);
    if (bottomSheetBackdrop) {
      bottomSheetBackdrop.addEventListener('click', (e) => {
        if (e.target === bottomSheetBackdrop) closeBottomSheet();
      });
    }
  }

  // Initialize on DOM Ready
  document.addEventListener('DOMContentLoaded', () => {
    bindInteractions();
    // Start at Landing Hub
    if (landingScreen) landingScreen.style.display = 'block';
    if (simulatorWrapper) simulatorWrapper.classList.remove('active');
  });

})();
