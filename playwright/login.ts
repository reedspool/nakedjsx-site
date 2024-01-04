import { test as base, expect } from "@playwright/test";
import type { Page, Locator } from "@playwright/test";

export class HomePage {
  private readonly inputBox: Locator;
  private readonly todoItems: Locator;

  constructor(public readonly page: Page) {
    this.inputBox = this.page.locator("input.new-todo");
    this.todoItems = this.page.getByTestId("todo-item");
  }

  async goto() {
    await this.page.goto("http://localhost:3001");
  }

  async addToDo(text: string) {
    await this.inputBox.fill(text);
    await this.inputBox.press("Enter");
  }

  async remove(text: string) {
    const todo = this.todoItems.filter({ hasText: text });
    await todo.hover();
    await todo.getByLabel("Delete").click();
  }

  async removeAll() {
    while ((await this.todoItems.count()) > 0) {
      await this.todoItems.first().hover();
      await this.todoItems.getByLabel("Delete").first().click();
    }
  }
}

type MyFixtures = {
  homePage: HomePage;
};
// Extend base test by providing "todoPage" and "settingsPage".
// This new "test" can be used in multiple test files, and each of them will get the fixtures.
export const test = base.extend<MyFixtures>({
  homePage: async ({ page }, use) => {
    // Set up the fixture.
    const homePage = new HomePage(page);
    await homePage.goto();

    // Use the fixture value in the test.
    await use(homePage);

    // Clean up the fixture.
  },
});

// @ts-ignore "Just mention" https://playwright.dev/docs/test-fixtures#using-a-fixture
test("Page has an HTML title (tab bar name)", async ({ page, homePage }) => {
  await expect(page).toHaveTitle("Record");
});

// @ts-ignore "Just mention" https://playwright.dev/docs/test-fixtures#using-a-fixture
test("Page instructs to log in", async ({ page, homePage }) => {
  expect(page.getByText("Please log in")).toBeVisible();
});

// @ts-ignore "Just mention" https://playwright.dev/docs/test-fixtures#using-a-fixture
test("Page has Main Menu button", async ({ page, homePage }) => {
  expect(page.getByText("Main Menu")).toBeVisible();
});

// @ts-ignore "Just mention" https://playwright.dev/docs/test-fixtures#using-a-fixture
test("Page has Google Sign-in button", async ({ page, homePage }) => {
  expect(page.getByText("Sign in with Google")).toBeVisible({
    timeout: 10_000_000,
  });
});
