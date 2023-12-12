import { assertSnackbarError } from '../../support/helpers';
import { myUser } from '../../fixtures/userFixtures';

function assertSuccessfulAuth(username) {
  // Confirm we have navigated to home
  cy.hash().should('eq', '#/');
  // Check store auth data
  cy.window()
    .its('cuttle.authStore')
    .then((store) => {
      expect(store.authenticated).to.eq(true);
      expect(store.username).to.eq(username);
    });
}

function assertFailedAuth(path) {
  // Confirm we have not navigated away from login/signup
  cy.hash().should('eq', path);
  // Check store auth data
  cy.window()
    .its('cuttle.authStore')
    .then((store) => {
      expect(store.authenticated).to.eq(false);
      expect(store.username).to.eq(null);
    });
}

function forceFormSubmit() {
  cy.get('[data-cy=submit]').then((btn) => {
    btn[0].disabled = false;
    btn.click();
  });
}

describe('Auth - Page Content', () => {
  beforeEach(() => {
    cy.wipeDatabase();
    cy.visit('#/signup');
    cy.signupOpponent(myUser);
  });

  it('Displays logo and navigates to rules page', () => {
    cy.get('#logo');
    cy.get('[data-cy=rules-link]').click();
    cy.hash().should('eq', '#/rules');
  });

  it('Navigates to /login if returning visiter, /signup if first new visiter', () => {
    cy.wipeDatabase();
    cy.get('[data-cy=password]').type(myUser.password);
    cy.get('[data-cy=username]').type(myUser.username + '{enter}');
    cy.get('[data-cy="user-menu"]').click();
    cy.get("[data-nav='Log Out']").click();
    cy.visit('/');
    cy.hash().should('eq', '#/login');
    cy.clearLocalStorage();
    cy.visit('/');
    cy.hash().should('eq', '#/signup');
  });
});

describe('Logging In', () => {
  beforeEach(() => {
    cy.wipeDatabase();
    cy.visit('#/login');
    cy.signupOpponent(myUser);
  });

  /**
   * Successful Logins
   */
  it('Can log into existing account with submit button', () => {
    cy.get('[data-cy=username]').type(myUser.username);
    cy.get('[data-cy=password]').type(myUser.password);
    cy.get('[data-cy=submit]').click();
    assertSuccessfulAuth(myUser.username);
  });
  it('Can login via enter key in username', () => {
    cy.get('[data-cy=password]').type(myUser.password);
    cy.get('[data-cy=username]').type(myUser.username + '{enter}');
    assertSuccessfulAuth(myUser.username);
  });
  it('Can login via enter key in password', () => {
    cy.get('[data-cy=username]').type(myUser.username);
    cy.get('[data-cy=password]').type(myUser.password + '{enter}');
    assertSuccessfulAuth(myUser.username);
  });

  /**
   * Rejected logins
   */
  it('Rejects login before signup', () => {
    cy.get('[data-cy=username]').type('unRegisteredUsername');
    cy.get('[data-cy=password]').type(myUser.password);
    cy.get('[data-cy=submit]').click();
    assertSnackbarError('Could not find that user with that username. Try signing up!', 'auth');
    assertFailedAuth('#/login');
  });
  it('Rejects incorrect password', () => {
    cy.get('[data-cy=username]').type(myUser.username);
    cy.get('[data-cy=password]').type('incorrectPw');
    cy.get('[data-cy=submit]').click();
    assertSnackbarError('Username and password do not match', 'auth');
    assertFailedAuth('#/login');
  });
});

describe('Signing Up', () => {
  beforeEach(() => {
    cy.wipeDatabase();
    cy.visit('#/signup');
  });

  /**
   * Successful Signups
   */
  it('Successfully signs up and navigates to home page', () => {
    cy.get('[data-cy=username]').type(myUser.username);
    cy.get('[data-cy=password]').type(myUser.password);
    cy.get('[data-cy=submit]').click();
    assertSuccessfulAuth(myUser.username);
  });
  it('Signs up by pressing enter on the username field', () => {
    cy.get('[data-cy=password]').type(myUser.password);
    cy.get('[data-cy=username]').type(myUser.username + '{enter}');
    assertSuccessfulAuth(myUser.username);
  });
  it('Signs up by pressing enter on the password field', () => {
    cy.get('[data-cy=username]').type(myUser.username);
    cy.get('[data-cy=password]').type(myUser.password + '{enter}');
    assertSuccessfulAuth(myUser.username);
  });

  /**
   * Rejected Signups
   */
  it('Requires password to be at least eight characters', () => {
    cy.get('[data-cy=username]').type(myUser.username);
    cy.get('[data-cy=password]').type('sh0rt');
    cy.get('#password-messages').should('contain', 'Password must contain at least eight characters');
    cy.get('[data-cy=submit]').should('not.be', 'enabled');
    forceFormSubmit();
    assertFailedAuth('#/signup');
    assertSnackbarError('Your password must contain at least eight characters', 'auth');
  });
  it('Password is required', () => {
    cy.get('[data-cy=username]').type(myUser.username);
    cy.get('[data-cy=submit]').should('not.be', 'enabled');
    forceFormSubmit();
    assertFailedAuth('#/signup');
    assertSnackbarError('Password is required', 'auth');
  });
  it('Username is required', () => {
    cy.get('[data-cy=password]').type(myUser.password);
    cy.get('[data-cy=submit]').should('not.be', 'enabled');
    forceFormSubmit();
    assertFailedAuth('#/signup');
    assertSnackbarError('Please provide a non-empty username', 'auth');
  });
  it('Rejects signup if username already exists', () => {
    cy.signupOpponent(myUser);
    cy.get('[data-cy=username]').type(myUser.username);
    cy.get('[data-cy=password]').type(myUser.password);
    cy.get('[data-cy=submit]').click();
    assertFailedAuth('#/signup');
    assertSnackbarError('That username is already registered to another user; try logging in!', 'auth');
  });

  describe('Show reauthenticate dialog', () => {
    beforeEach(() => {
      cy.setupGameAsP0();
    });

    it('Sow reauthenticate dialog', () => {
      cy.clearCookies();
      cy.reload();
      cy.wait(5000)
      cy.get('[data-cy=password]').should('be.visible');
    });

    it('Reauthenticate dialog error', () => {
      cy.clearCookies();
      cy.reload();
      cy.wait(5000)
      cy.get('[data-cy=password]').should('be.visible');

      cy.get('[data-cy=password]').type("wrongpassword");
      cy.get('[data-cy=username]').type(myUser.username + '{enter}');

      cy.get('[data-cy=snackbar]').should('be.visible');
    });

    it('Reauthenticate dialog success', () => {
      cy.clearCookies();

      cy.vueRoute('/');

      cy.window()
          .its('cuttle.authStore')
          .then((store) => {
            store.mustReauthenticate = true;
          });

      cy.window()
          .its('cuttle.gameStore')
          .then((store) => {
            cy.vueRoute('/game/' + store.id);
          });

      cy.get('[data-cy=password]').type(myUser.password + '{enter}');
      cy.get('[data-cy=password]').should('not.be.visible');
    });
  });
});
