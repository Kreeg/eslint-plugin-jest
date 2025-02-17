import { TSESLint } from '@typescript-eslint/experimental-utils';
import dedent from 'dedent';
import rule from '../prefer-expect-assertions';
import { espreeParser } from './test-utils';

const ruleTester = new TSESLint.RuleTester({
  parser: espreeParser,
  parserOptions: {
    ecmaVersion: 2017,
  },
});

ruleTester.run('prefer-expect-assertions', rule, {
  valid: [
    'test("nonsense", [])',
    'test("it1", () => {expect.assertions(0);})',
    'test("it1", function() {expect.assertions(0);})',
    'test("it1", function() {expect.hasAssertions();})',
    'it("it1", function() {expect.assertions(0);})',
    dedent`
      it("it1", function() {
        expect.assertions(1);
        expect(someValue).toBe(true)
      })
    `,
    'test("it1")',
    'itHappensToStartWithIt("foo", function() {})',
    'testSomething("bar", function() {})',
    'it(async () => {expect.assertions(0);})',
    {
      code: dedent`
        it("it1", async () => {
          expect.assertions(1);
          expect(someValue).toBe(true)
        })
      `,
      options: [{ onlyFunctionsWithAsyncKeyword: true }],
    },
    {
      code: dedent`
        it("it1", function() {
          expect(someValue).toBe(true)
        })
      `,
      options: [{ onlyFunctionsWithAsyncKeyword: true }],
    },
    {
      code: 'it("it1", () => {})',
      options: [{ onlyFunctionsWithAsyncKeyword: true }],
    },
  ],
  invalid: [
    {
      code: 'it("it1", () => {})',
      errors: [
        {
          messageId: 'haveExpectAssertions',
          column: 1,
          line: 1,
          suggestions: [
            {
              messageId: 'suggestAddingHasAssertions',
              output: 'it("it1", () => {expect.hasAssertions();})',
            },
            {
              messageId: 'suggestAddingAssertions',
              output: 'it("it1", () => {expect.assertions();})',
            },
          ],
        },
      ],
    },
    {
      code: 'it("it1", () => { foo()})',
      errors: [
        {
          messageId: 'haveExpectAssertions',
          column: 1,
          line: 1,
          suggestions: [
            {
              messageId: 'suggestAddingHasAssertions',
              output: 'it("it1", () => { expect.hasAssertions();foo()})',
            },
            {
              messageId: 'suggestAddingAssertions',
              output: 'it("it1", () => { expect.assertions();foo()})',
            },
          ],
        },
      ],
    },
    {
      code: dedent`
        it("it1", function() {
          someFunctionToDo();
          someFunctionToDo2();
        })
      `,
      errors: [
        {
          messageId: 'haveExpectAssertions',
          column: 1,
          line: 1,
          suggestions: [
            {
              messageId: 'suggestAddingHasAssertions',
              output: dedent`
                it("it1", function() {
                  expect.hasAssertions();someFunctionToDo();
                  someFunctionToDo2();
                })
              `,
            },
            {
              messageId: 'suggestAddingAssertions',
              output: dedent`
                it("it1", function() {
                  expect.assertions();someFunctionToDo();
                  someFunctionToDo2();
                })
              `,
            },
          ],
        },
      ],
    },
    {
      code: 'it("it1", function() {var a = 2;})',
      errors: [
        {
          messageId: 'haveExpectAssertions',
          column: 1,
          line: 1,
          suggestions: [
            {
              messageId: 'suggestAddingHasAssertions',
              output:
                'it("it1", function() {expect.hasAssertions();var a = 2;})',
            },
            {
              messageId: 'suggestAddingAssertions',
              output: 'it("it1", function() {expect.assertions();var a = 2;})',
            },
          ],
        },
      ],
    },
    {
      code: 'it("it1", function() {expect.assertions();})',
      errors: [
        {
          messageId: 'assertionsRequiresOneArgument',
          column: 30,
          line: 1,
          suggestions: [],
        },
      ],
    },
    {
      code: 'it("it1", function() {expect.assertions(1,2);})',
      errors: [
        {
          messageId: 'assertionsRequiresOneArgument',
          column: 43,
          line: 1,
          suggestions: [
            {
              messageId: 'suggestRemovingExtraArguments',
              output: 'it("it1", function() {expect.assertions(1);})',
            },
          ],
        },
      ],
    },
    {
      code: 'it("it1", function() {expect.assertions("1");})',
      errors: [
        {
          messageId: 'assertionsRequiresNumberArgument',
          column: 41,
          line: 1,
          suggestions: [],
        },
      ],
    },
    {
      code: 'it("it1", function() {expect.hasAssertions("1");})',
      errors: [
        {
          messageId: 'hasAssertionsTakesNoArguments',
          column: 30,
          line: 1,
          suggestions: [
            {
              messageId: 'suggestRemovingExtraArguments',
              output: 'it("it1", function() {expect.hasAssertions();})',
            },
          ],
        },
      ],
    },
    {
      code: 'it("it1", function() {expect.hasAssertions("1", "2");})',
      errors: [
        {
          messageId: 'hasAssertionsTakesNoArguments',
          column: 30,
          line: 1,
          suggestions: [
            {
              messageId: 'suggestRemovingExtraArguments',
              output: 'it("it1", function() {expect.hasAssertions();})',
            },
          ],
        },
      ],
    },
    {
      code: dedent`
        it("it1", function() {
          expect.hasAssertions(() => {
            someFunctionToDo();
            someFunctionToDo2();
          });
        })
      `,
      errors: [
        {
          messageId: 'hasAssertionsTakesNoArguments',
          column: 10,
          line: 2,
          suggestions: [
            {
              messageId: 'suggestRemovingExtraArguments',
              output: dedent`
                it("it1", function() {
                  expect.hasAssertions();
                })
              `,
            },
          ],
        },
      ],
    },
    {
      code: dedent`
        it("it1", async function() {
          expect(someValue).toBe(true);
        })
      `,
      options: [{ onlyFunctionsWithAsyncKeyword: true }],
      errors: [
        {
          messageId: 'haveExpectAssertions',
          column: 1,
          line: 1,
        },
      ],
    },
  ],
});

ruleTester.run('.each support', rule, {
  valid: [
    'test.each()("is fine", () => { expect.assertions(0); })',
    'test.each``("is fine", () => { expect.assertions(0); })',
    'test.each()("is fine", () => { expect.hasAssertions(); })',
    'test.each``("is fine", () => { expect.hasAssertions(); })',
    'it.each()("is fine", () => { expect.assertions(0); })',
    'it.each``("is fine", () => { expect.assertions(0); })',
    'it.each()("is fine", () => { expect.hasAssertions(); })',
    'it.each``("is fine", () => { expect.hasAssertions(); })',
    {
      code: 'test.each()("is fine", () => {})',
      options: [{ onlyFunctionsWithAsyncKeyword: true }],
    },
    {
      code: 'test.each``("is fine", () => {})',
      options: [{ onlyFunctionsWithAsyncKeyword: true }],
    },
    {
      code: 'it.each()("is fine", () => {})',
      options: [{ onlyFunctionsWithAsyncKeyword: true }],
    },
    {
      code: 'it.each``("is fine", () => {})',
      options: [{ onlyFunctionsWithAsyncKeyword: true }],
    },
    dedent`
      describe.each(['hello'])('%s', () => {
        it('is fine', () => {
          expect.assertions(0);
        });
      });
    `,
    dedent`
      describe.each\`\`('%s', () => {
        it('is fine', () => {
          expect.assertions(0);
        });
      });
    `,
    dedent`
      describe.each(['hello'])('%s', () => {
        it('is fine', () => {
          expect.hasAssertions();
        });
      });
    `,
    dedent`
      describe.each\`\`('%s', () => {
        it('is fine', () => {
          expect.hasAssertions();
        });
      });
    `,
    dedent`
      describe.each(['hello'])('%s', () => {
        it.each()('is fine', () => {
          expect.assertions(0);
        });
      });
    `,
    dedent`
      describe.each\`\`('%s', () => {
        it.each()('is fine', () => {
          expect.assertions(0);
        });
      });
    `,
    dedent`
      describe.each(['hello'])('%s', () => {
        it.each()('is fine', () => {
          expect.hasAssertions();
        });
      });
    `,
    dedent`
      describe.each\`\`('%s', () => {
        it.each()('is fine', () => {
          expect.hasAssertions();
        });
      });
    `,
  ],
  invalid: [
    {
      code: dedent`
        test.each()("is not fine", () => {
          expect(someValue).toBe(true);
        });
      `,
      errors: [
        {
          messageId: 'haveExpectAssertions',
          column: 1,
          line: 1,
        },
      ],
    },
    {
      code: dedent`
        describe.each()('something', () => {
          it("is not fine", () => {
            expect(someValue).toBe(true);
          });
        });
      `,
      errors: [
        {
          messageId: 'haveExpectAssertions',
          column: 3,
          line: 2,
        },
      ],
    },
    {
      code: dedent`
        describe.each()('something', () => {
          test.each()("is not fine", () => {
            expect(someValue).toBe(true);
          });
        });
      `,
      errors: [
        {
          messageId: 'haveExpectAssertions',
          column: 3,
          line: 2,
        },
      ],
    },
    {
      code: dedent`
        test.each()("is not fine", async () => {
          expect(someValue).toBe(true);
        });
      `,
      options: [{ onlyFunctionsWithAsyncKeyword: true }],
      errors: [
        {
          messageId: 'haveExpectAssertions',
          column: 1,
          line: 1,
        },
      ],
    },
    {
      code: dedent`
        it.each()("is not fine", async () => {
          expect(someValue).toBe(true);
        });
      `,
      options: [{ onlyFunctionsWithAsyncKeyword: true }],
      errors: [
        {
          messageId: 'haveExpectAssertions',
          column: 1,
          line: 1,
        },
      ],
    },
    {
      code: dedent`
        describe.each()('something', () => {
          test.each()("is not fine", async () => {
            expect(someValue).toBe(true);
          });
        });
      `,
      options: [{ onlyFunctionsWithAsyncKeyword: true }],
      errors: [
        {
          messageId: 'haveExpectAssertions',
          column: 3,
          line: 2,
        },
      ],
    },
  ],
});
