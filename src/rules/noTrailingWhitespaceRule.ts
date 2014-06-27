/*
 * Copyright 2013 Palantir Technologies, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
*/

/// <reference path='../../lib/tslint.d.ts' />

export class Rule extends Lint.Rules.AbstractRule {
    public static FAILURE_STRING = "trailing whitespace";

    public apply(syntaxTree: TypeScript.SyntaxTree): Lint.RuleFailure[] {
        return this.applyWithWalker(new NoTrailingWhitespaceWalker(syntaxTree, this.getOptions()));
    }
}

class NoTrailingWhitespaceWalker extends Lint.RuleWalker {

    public visitToken(token: TypeScript.ISyntaxToken) {
        var leadingTrivia = token.leadingTrivia();
        var trailingTrivia = token.trailingTrivia();
        var position = this.position();
        var trailingPosition = position + leadingTrivia.fullWidth() + token.width();

        this.checkForTrailingWhitespace(leadingTrivia, position);
        this.checkForTrailingWhitespace(trailingTrivia, trailingPosition);

        super.visitToken(token);
    }

    private checkForTrailingWhitespace(triviaList: TypeScript.ISyntaxTriviaList, position: number) {
        var start = position;

        for (var i = 0; i < triviaList.count() - 1; i++) {
            var trivia = triviaList.syntaxTriviaAt(i);
            var nextTrivia = triviaList.syntaxTriviaAt(i + 1);

            // look for whitespace trivia immediately preceding new line trivia
            if (trivia.kind() === TypeScript.SyntaxKind.WhitespaceTrivia && nextTrivia.kind() === TypeScript.SyntaxKind.NewLineTrivia) {
                var width = trivia.fullWidth();
                var failure = this.createFailure(start, width, Rule.FAILURE_STRING);

                this.addFailure(failure);
            }

            // update the position
            start += trivia.fullWidth();
        }
    }
}
