# Project: M-x-ify Evil Macros 

I often make keyboard macros in Emacs's `evil-mode`, and I want to save them by name so that they persist when I close and re-open Emacs.

This has been incredibly useful for me. For example, here's a macro I use every day to write new entries into the logbooks on this site:

```lisp
(defalias 'macro/insert-project-log-header-with-timestamp
   (kmacro "o # # # <escape> : r ! SPC d a t e <return> k J o <return>"))
```

For a time, I typed every key in that `kmacro` string 3 or 4 times a day to insert well-formatted Markdown headings with a timestamp, like this:

```text
### <the output of vi Ex-command `r! date` here>
<new line>
<my cursor ends up here, in insert mode!>
```

## Dependencies

This only works with `kmacro` which is a recent edition to Emacs with no backwards compatibility. If `(kmacro-p nil)` throws an error for you instead of returning `nil`, then unfortunately the strategy I describe below won't work. Though you may have luck starting from the same [StackExchange message](https://emacs.stackexchange.com/a/68341) I did and working out from there!

I also use [Doom Emacs](https://github.com/doomemacs/doomemacs) but I hope that nothing I'm writing here is dependent on Doom. Please let me know if anything doesn't work for you!

## How to use

Step 1. Add this interactive function definition to your configuration:

```lisp
(defun insert-kbd-macro-in-register-with-name (register name)
  "insert macro from register. prompt for register key
if no argument passed. you may need to revise inserted s-expression."
  (interactive "cthe register key:\nsname: ")
  (let* ((macro (cdr (assoc register register-alist)))
         (macro-string (with-temp-buffer
                         ;; Reed modified this to use a unique (but not safe) symbol
                         ;; instead of 'last-kbd-macro because that uses defalias instead
                         (fset (intern name) macro)
                         (insert-kbd-macro (intern name))
                         (buffer-string))))
    (insert macro-string)))
```

Step 2. Record an evil macro. I don't know if this works with normal Emacs macros, but I assume it does. I only use evil keyboard macros, but I believe they are implemented as Emacs macros under the hood? I have never had a reason to look deeply into it.

Step 3. Put your pointer where you'd like to output the macro definition. I use a separate `+macros` file which I source in my configuration, however you could put it anywhere, even directly above or below the `defun` in Step 1.

Step 4. `M-x insert-kbd-macro-in-register-with-name RET <register name> RET <your-name>`. The register name will be the key you recorded the macro into, so if you recorded the macro starting with `q a` then `a` will be the register name.

Step 5. A wild `defalias` has appeared! You can evaluate this form (`C-x C-e`) immediately or restart Emacs to rerun your new configuration.

Step 6. `M-x <your-name> RET` should run your macro!

## Logbook

### Fri Dec 22 08:29:43 AM PST 2023

I know the title I began with, `M-x-ify Evil Macros`, was jargon filled and exclusionary, but I couldn't resist the weirdness once it popped into my head. Also, I wasn't going to explain Emacs and vi macros from the ground up in this post, so I felt it was okay if this wasn't the most broadly applicable title.

Before this project, the only way I knew to add something to the `M-x` menu in Emacs was to write Elisp and use the `(interactive)` declaration.

My first commit [private](https://github.com/reedspool/dotfiles/blob/3d19e4ccdadb221ca81aaa206e4c16ac4f345e10/emacs/dot_doom.d/%2Bfunctions.el#L743) for this work appears to be March 19, 2023, though it may be older as `git` history isn't a great source.

I started with this [StackExchange message](https://emacs.stackexchange.com/a/68341) and modified the code there to use a unique symbol (but not safely unique a la `gensym`) instead of `last-kbd-macro`. I don't remember exactly why.

That code looks like this:

```lisp
(defun insert-kbd-macro-in-register (register)
  "insert macro from register. prompt for register key
if no argument passed. you may need to revise inserted s-expression."
  (interactive "cthe register key:")
  (let* ((macro (cdr (assoc register register-alist)))
         (macro-string (with-temp-buffer
                         (fset 'tmp-my-macro macro)
                         (insert-kbd-macro 'tmp-my-macro)
                         (buffer-string))))
    (insert macro-string)))
```

Then I adapted that code to give a custom name for the `defalias` output. The code is very similar. If I were better at Elisp, I may have abstracted the two into a common root instead of copying and pasting. Though I almost never use the first version, so I might just get rid of it. Here's the named version:

```lisp
(defun insert-kbd-macro-in-register-with-name (register name)
  "insert macro from register. prompt for register key
if no argument passed. you may need to revise inserted s-expression."
  (interactive "cthe register key:\nsname: ")
  (let* ((macro (cdr (assoc register register-alist)))
         (macro-string (with-temp-buffer
                         ;; Reed modified this to use a unique (but not safe) symbol
                         ;; instead of 'last-kbd-macro because that uses defalias instead
                         (fset (intern name) macro)
                         (insert-kbd-macro (intern name))
                         (buffer-string))))
    (insert macro-string)))
```

That's currently the exact same as at the top of this file in the "How to use" section.

I wanted to do a quick write up to share with some fellow Emacsers!
