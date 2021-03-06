(() => {

  const $ToolParagraph = document.getElementById('tool-paragraph_unc2741');
  const $ToolRemoteImage = document.getElementById('tool-remote-image_unc2741');
  const $ToolRemoteVideo = document.getElementById('tool-remote-video_unc2741');
  const $ToolRemoteEmbed = document.getElementById('tool-remote-embed_unc2741');

  const $ToolBold = document.getElementById('tool-bold_unc2741');
  const $ToolItalic = document.getElementById('tool-italic_unc2741');
  const $ToolUnderline = document.getElementById('tool-underline_unc2741');
  const $ToolStrike = document.getElementById('tool-strike_unc2741');
  const $ToolApplyLink = document.getElementById('tool-apply-link_unc2741');
  const $ToolSuperscript = document.getElementById('tool-superscript_unc2741');
  const $ToolSubscript = document.getElementById('tool-subscript_unc2741');
  const $ToolClear = document.getElementById('tool-clear_unc2741');
  const $ToolEmojis = document.getElementById('tool-emojis_unc2741');


  const $InputRemoteImage = N.$Toolbar.querySelector('.remote-image-view input');
  const $CancelRemoteImage = N.$Toolbar.querySelector('.remote-image-view .cancel-tool');
  const $ValidateRemoteImage = N.$Toolbar.querySelector('.remote-image-view .validate-tool');

  const $InputRemoteVideo = N.$Toolbar.querySelector('.remote-video-view input');
  const $CancelRemoteVideo = N.$Toolbar.querySelector('.remote-video-view .cancel-tool');
  const $ValidateRemoteVideo = N.$Toolbar.querySelector('.remote-video-view .validate-tool');

  const $InputRemoteEmbed = N.$Toolbar.querySelector('.remote-embed-view input');
  const $CancelRemoteEmbed = N.$Toolbar.querySelector('.remote-embed-view .cancel-tool');
  const $ValidateRemoteEmbed = N.$Toolbar.querySelector('.remote-embed-view .validate-tool');

  const $InputApplyLink = N.$Toolbar.querySelector('.apply-link-view input');
  const $CancelApplyLink = N.$Toolbar.querySelector('.apply-link-view .cancel-tool');
  const $ValidateApplyLink = N.$Toolbar.querySelector('.apply-link-view .validate-tool');

  const $InputEmojis = N.$Toolbar.querySelector('.emojis-view input');
  const $CancelEmojis = N.$Toolbar.querySelector('.emojis-view .cancel-tool');
  const $SearchEmojis = N.$Toolbar.querySelector('.emojis-view .search-button');
  const $EmojisList = N.$Toolbar.querySelector('.emojis-view .emojis-list');
  const Emojis = N.Functions.IO.funcLoadEmojis();



  const funcToolButtonsCompatibility = (Parameter) => {
    const $Button = Parameter.$ButtonClicked;
    let boolCanFormat = true;

    // Some tools incompatibilities with activated lists
    if (N.$ToolUnorderedList.classList.contains('active') || N.$ToolOrderedList.classList.contains('active')) {
      if (
        $Button === $ToolParagraph || $Button === N.$ToolQuote ||
        $Button === N.$ToolH1 || $Button === N.$ToolH2 || $Button === N.$ToolH3 || $Button === N.$ToolH4 || $Button === N.$ToolH5 || $Button === N.$ToolH6
      ) {
        boolCanFormat = false;
      }
    }

    // List tools incompatibilities with some activated tools
    if ($Button === N.$ToolUnorderedList || $Button === N.$ToolOrderedList) {
      if (
        N.$ToolQuote.classList.contains('active') || N.$ToolH1.classList.contains('active') || N.$ToolH2.classList.contains('active') || N.$ToolH3.classList.contains('active') || N.$ToolH4.classList.contains('active') || N.$ToolH5.classList.contains('active') || N.$ToolH6.classList.contains('active')
      ) {
        boolCanFormat = false;
      }
    }

    return boolCanFormat;
  };



  N.$Toolbar.addEventListener('mousedown', (Event) => {
    Event.preventDefault();
  });
  forEach(N.$Toolbar.getElementsByTagName('input'), ($Input) => {
    $Input.addEventListener('mousedown', (Event) => {
      Event.stopPropagation();
    });
  });


  forEach(N.$Toolbar.querySelectorAll('.tools-list-view li'), ($Button) => {
    $Button.addEventListener('click', () => {
      const boolCanFormat = funcToolButtonsCompatibility({ $ButtonClicked: $Button });

      if (boolCanFormat) {
        if ($Button.dataset.cmd) {
          if ($Button.dataset.cmdparam) {
            // http://stackoverflow.com/questions/1723287/calling-a-javascript-function-named-in-a-variable
            N.DocActive.Editor[$Button.dataset.cmd]($Button.dataset.cmdparam);
          } else {
            N.DocActive.Editor[$Button.dataset.cmd]();
          }
        } else if ($Button.dataset.tag) {
          N.DocActive.Editor.format($Button.dataset.tag);

          // if it's a heading tool button
          if (N.RegExpHeading.test($Button.dataset.tag)) {
            N.Functions.Dialogs.funcUpdateTableContent();
          }
        } else {
          N.DocActive.LastSelection = lightrange.saveSelection();
          N.$Toolbar.dataset.view = $Button.id.replace('tool-', '').replace('_unc2741', '');
          N.Functions.Toolbar.funcAutoPosition();

          if ($Button === $ToolRemoteImage) {
            $InputRemoteImage.select();
          }
          else if ($Button === $ToolRemoteVideo) {
            $InputRemoteVideo.select();
          }
          else if ($Button === $ToolRemoteEmbed) {
            $InputRemoteEmbed.select();
          }
          else if ($Button === $ToolApplyLink) {
            $InputApplyLink.select();
          }
          else if ($Button === $ToolEmojis) {
            $InputEmojis.select();
          }
        }

        N.Functions.Toolbar.funcCheckTools();
      }

    });
  });



  forEach(N.$Toolbar.getElementsByClassName('cancel-tool'), ($Button) => {
    $Button.addEventListener('click', () => {
      N.Functions.Toolbar.funcResetView();
    });
  });


  $ValidateRemoteImage.addEventListener('click', () => {
    if ($InputRemoteImage.value) {
      $InputRemoteImage.classList.remove('invalid');
      lightrange.restoreSelection(N.DocActive.LastSelection);
      N.DocActive.Editor.insertImage($InputRemoteImage.value + N.Functions.Utils.funcNoCacheSuffix());
      N.Functions.Toolbar.funcResetView();
      N.Functions.Toolbar.funcAutoPosition();
    } else {
      $InputRemoteImage.classList.add('invalid');
    }
  });


  $ValidateRemoteVideo.addEventListener('click', () => {
    const ParsedURL = urlParser.parse($InputRemoteVideo.value);

    if (ParsedURL) {
      $InputRemoteVideo.classList.remove('invalid');

      lightrange.restoreSelection(N.DocActive.LastSelection);

      // Cleared & Embed URL
      const strEmbedURL = urlParser.create({
        videoInfo: ParsedURL,
        format: 'embed'
      });

      // All embed video player at the same dimensions : 560px x 315px, which is the YouTube dimensions.
      if (ParsedURL.provider === 'youtube' || ParsedURL.provider === 'vimeo' || ParsedURL.provider === 'dailymotion' || ParsedURL.provider === 'twitch') {
        let strProtocol = '';

        if (ParsedURL.provider === 'youtube' || ParsedURL.provider === 'vimeo') {
          strProtocol = 'https:';
        } else if (ParsedURL.provider === 'dailymotion') {
          strProtocol = 'http:';
        }

        N.DocActive.Editor.insertHTML(`<iframe src="${strProtocol}${strEmbedURL}" width="560" height="315" allowfullscreen></iframe>`);
      }

      N.Functions.Toolbar.funcResetView();
      N.Functions.Toolbar.funcAutoPosition();
    }
    else {
      $InputRemoteVideo.classList.add('invalid');
    }
  });


  $ValidateRemoteEmbed.addEventListener('click', () => {
    let strEmbedCode = $InputRemoteEmbed.value;
    const RegExpEmbed = new RegExp(/^<iframe.+><\/iframe>$/, 'i');

    if (RegExpEmbed.test(strEmbedCode)) {
      $InputRemoteEmbed.classList.remove('invalid');

      lightrange.restoreSelection(N.DocActive.LastSelection);

      strEmbedCode = N.Functions.Content.funcPurifyHTML({
        strHTML: strEmbedCode,
        strAllowedContentMode: 'embed'
      });

      N.DocActive.Editor.insertHTML(strEmbedCode);

      N.Functions.Toolbar.funcResetView();
      N.Functions.Toolbar.funcAutoPosition();
    }
    else {
      $InputRemoteEmbed.classList.add('invalid');
    }
  });


  $ValidateApplyLink.addEventListener('click', () => {
    if ($InputApplyLink.value) {
      $InputApplyLink.classList.remove('invalid');
      lightrange.restoreSelection(N.DocActive.LastSelection);
      N.DocActive.Editor.insertLink($InputApplyLink.value);
      N.Functions.Toolbar.funcResetView();
      N.Functions.Toolbar.funcAutoPosition();
    } else {
      $InputApplyLink.classList.add('invalid');
    }
  });



  // forEach(Emojis, (Emoji) => {
  //   console.log(Emoji);
  // });

  forEach(N.$Toolbar.querySelectorAll('.emojis-view .category-buttons li'), ($Button) => {
    $Button.addEventListener('click', () => {
      // https://github.com/zengabor/zenscroll#8-execute-something-when-the-scrolling-is-done
      // .center(element, duration, offset, onDone)
      zenscroll.createScroller($EmojisList).center(document.querySelector($Button.dataset.anchor), null, -5);
    });
  });



  $InputRemoteImage.addEventListener('keyup', (Event) => {
    // Enter
    if (Event.keyCode === 13) {
      $ValidateRemoteImage.click();
    }
    // Escape
    else if (Event.keyCode === 27) {
      $CancelRemoteImage.click();
    }
  });

  $InputRemoteVideo.addEventListener('keyup', (Event) => {
    // Enter
    if (Event.keyCode === 13) {
      $ValidateRemoteVideo.click();
    }
    // Escape
    else if (Event.keyCode === 27) {
      $CancelRemoteVideo.click();
    }
  });

  $InputRemoteEmbed.addEventListener('keyup', (Event) => {
    // Enter
    if (Event.keyCode === 13) {
      $ValidateRemoteEmbed.click();
    }
    // Escape
    else if (Event.keyCode === 27) {
      $CancelRemoteEmbed.click();
    }
  });

  $InputApplyLink.addEventListener('keyup', (Event) => {
    // Enter
    if (Event.keyCode === 13) {
      $ValidateApplyLink.click();
    }
    // Escape
    else if (Event.keyCode === 27) {
      $CancelApplyLink.click();
    }
  });

  $InputEmojis.addEventListener('keyup', (Event) => {
    // Enter
    if (Event.keyCode === 13) {
      $SearchEmojis.click();
    }
    // Escape
    else if (Event.keyCode === 27) {
      $CancelEmojis.click();
    }
  });



  Mousetrap.bindGlobal('mod+1', () => {
    N.$ToolH1.click();
  });
  Mousetrap.bindGlobal('mod+2', () => {
    N.$ToolH2.click();
  });
  Mousetrap.bindGlobal('mod+3', () => {
    N.$ToolH3.click();
  });
  Mousetrap.bindGlobal('mod+4', () => {
    N.$ToolH4.click();
  });
  Mousetrap.bindGlobal('mod+5', () => {
    N.$ToolH5.click();
  });
  Mousetrap.bindGlobal('mod+6', () => {
    N.$ToolH6.click();
  });

  Mousetrap.bindGlobal('mod+shift+p', () => {
    $ToolParagraph.click();
  });
  Mousetrap.bindGlobal('mod+shift+q', () => {
    N.$ToolQuote.click();
  });
  Mousetrap.bindGlobal('mod+shift+l', () => {
    N.$ToolUnorderedList.click();
  });
  Mousetrap.bindGlobal('mod+alt+l', () => {
    N.$ToolOrderedList.click();
  });
  Mousetrap.bindGlobal('mod+alt+i', () => {
    N.$Toolbar.classList.add('active');
    $ToolRemoteImage.click();
  });
  Mousetrap.bindGlobal('mod+alt+v', () => {
    N.$Toolbar.classList.add('active');
    $ToolRemoteVideo.click();
    // Prevent triggering the paste event
    return false;
  });

  Mousetrap.bindGlobal('mod+b', () => {
    $ToolBold.click();
    // Prevent the Chromium default shortcut
    return false;
  });
  Mousetrap.bindGlobal('mod+i', () => {
    $ToolItalic.click();
    return false;
  });
  Mousetrap.bindGlobal('mod+u', () => {
    $ToolUnderline.click();
    return false;
  });
  Mousetrap.bindGlobal('mod+alt+s', () => {
    $ToolStrike.click();
  });
  Mousetrap.bindGlobal('mod+l', () => {
    N.$Toolbar.classList.add('active');
    $ToolApplyLink.click();
  });
  Mousetrap.bindGlobal('mod+shift+up', () => {
    $ToolSuperscript.click();
  });
  Mousetrap.bindGlobal('mod+shift+down', () => {
    $ToolSubscript.click();
  });
  Mousetrap.bindGlobal('mod+shift+c', () => {
    $ToolClear.click();
  });

})();
