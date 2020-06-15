<template>
  <div id="app">
    <div class="container">
      <h2 class="is-size-3 has-text-centered padding-medium title my-4">Opyn Dashboard</h2>
      <router-view />
    </div>
  </div>
</template>

<style lang="scss">

// Import Bulma's core
@import "~bulma/sass/utilities/_all";
$grey-lighter: #fdf6e3;
$grey-light: #eee8d5;
$grey: #839496;
$grey-alt: #586e75;
$grey-dark: #073642;
$grey-darker: #002b36;

$orange: #cb4b16;
$yellow: #b58900;
$green: #859900;
$cyan: #2aa198;
$blue: #268bd2;
$purple: #6c71c4;
$red: #d33682;

$black-bis: rgb(18, 18, 18);

$primary: $cyan !default;
$warning: $orange;
$info: $blue;
$yellow-invert: #fff;

$light: $grey-lighter;
$dark: darken($grey-darker, 3);

$family-sans-serif: "Lato", -apple-system, BlinkMacSystemFont, "Segoe UI",
  "Helvetica Neue", "Helvetica", "Arial", sans-serif;
$family-monospace: "Inconsolata", "Consolas", "Monaco", monospace;

$radius-small: 3px;
$radius: 0.4em;
$radius-large: 8px;

$body-size: 15px;
$size-7: 0.85em;

$title-weight: 500;
$subtitle-weight: 400;
$subtitle-color: $grey-dark;

$border-width: 2px;
$border: $grey-dark;

$body-background-color: $grey-darker;
$background: $grey-dark;
$footer-background-color: $background;

$title-color: $grey;
$subtitle-color: $grey-alt;
$subtitle-strong-color: $grey-light;

$text: $grey;
$text-light: lighten($text, 10);
$text-strong: darken($text, 5);

$box-shadow: none;
$box-background-color: $grey-dark;

$card-shadow: none;
$card-background-color: $grey-darker;
$card-header-box-shadow: none;
$card-header-background-color: rgba($black-bis, 0.2);
$card-footer-background-color: rgba($black-bis, 0.2);

$link: $yellow;
$link-hover: $grey-light;
$link-hover-border: $grey-light;
$link-focus: darken($grey-light, 10);
$link-focus-border: $grey-light;
$link-active: darken($grey-light, 10);

$button-color: $grey;
$button-background-color: $background;
$button-border-color: $grey;

$input-color: $grey;
$input-icon-color: darken($grey-light, 10);
$input-background-color: $grey-lighter;
$input-border-color: darken($grey-light, 10);
$input-hover-color: $grey-light;
$input-disabled-background-color: $grey-dark;
$input-disabled-border-color: $grey-dark;

$table-color: $text;
$table-head-color: $grey-lighter;
$table-background-color: $grey-dark;
$table-cell-border: 1px solid $grey;

$table-row-hover-background-color: $grey-darker;
$table-striped-row-even-background-color: $grey-darker;
$table-striped-row-even-hover-background-color: lighten($grey-darker, 4);

$pagination-border-color: $border;

$navbar-background-color: $grey-dark;
$navbar-item-color: $grey;
$navbar-item-hover-color: $grey-lighter;
$navbar-item-active-color: $grey-lighter;
$navbar-item-active-background-color: transparent;
$navbar-item-hover-background-color: transparent;
$navbar-dropdown-border-top: 1px solid $grey-darker;
$navbar-divider-background-color: $grey-darker;
$navbar-dropdown-arrow: #fff;
$navbar-dropdown-background-color: $grey-dark;
$navbar-dropdown-item-hover-color: $grey-lighter;
$navbar-dropdown-item-hover-background-color: lighten($grey-darker, 4);
$navbar-dropdown-item-active-background-color: lighten($grey-darker, 4);
$navbar-dropdown-item-active-color: $grey-lighter;

$dropdown-content-background-color: $background;
$dropdown-item-color: $text;
$dropdown-item-hover-color: $link-hover;

$bulmaswatch-import-font: true !default;



.section {
  background-color: $grey-darker;
}

hr {
  height: $border-width;
}

h6 {
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.hero {
  background-color: $grey-dark;
}

a {
  transition: all 200ms ease;
}

.mx-4 {
  margin-left: 1rem!important;
  margin-right: 1rem!important;
}

.my-4 {
  margin-top: 1rem!important;
  margin-bottom: 1rem!important;
}

.content blockquote {
  border-color: $grey;
}

.button {
  transition: all 200ms ease;
  border-width: $border-width;

  &.is-active,
  &.is-focused,
  &:active,
  &:focus {
    box-shadow: 0 0 0 2px;
  }

  &.is-loading:after {
    border-color: transparent transparent $button-border-color
      $button-border-color;
  }
  @each $name, $pair in $colors {
    $color: nth($pair, 1);
    $color-invert: nth($pair, 2);

    &.is-#{$name} {
      &.is-hovered,
      &:hover {
        background-color: lighten($color, 7.5%);
      }

      &.is-active,
      &.is-focused,
      &:active,
      &:focus {
        border-color: $color;
        box-shadow: 0 0 0 2px rgba($color, 0.5);
      }
    }
  }
}

.label {
  color: $grey-lighter;
}

.button,
.input,
.pagination-ellipsis,
.pagination-link,
.pagination-next,
.pagination-previous,
.select,
.select select,
.textarea,
.control.has-icons-left .icon,
.control.has-icons-right .icon {
  height: 2.5em;
}

.input,
.textarea {
  transition: all 200ms ease;
  box-shadow: none;
  border-width: $border-width;
  padding-left: 1em;
  padding-right: 1em;
}

.select {
  &:after,
  select {
    border-width: $border-width;
  }
}

.control {
  &.has-addons {
    .button,
    .input,
    .select {
      margin-right: -$border-width;
    }
  }
}

.progress {
  &::-webkit-progress-value {
    background-color: $grey;
  }

  &::-moz-progress-bar {
    background-color: $grey;
  }
}

.card {
  $card-border-color: lighten($grey-darker, 5);
  border: $border-width solid $card-border-color;
  border-radius: $radius;

  .card-image {
    img {
      border-radius: $radius $radius 0 0;
    }
  }

  .card-header {
    border-radius: $radius $radius 0 0;
  }

  .card-footer,
  .card-footer-item {
    border-width: $border-width;
    border-color: $card-border-color;
  }
}

.notification {
  @each $name, $pair in $colors {
    $color: nth($pair, 1);
    $color-invert: nth($pair, 2);

    &.is-#{$name} {
      a:not(.button) {
        color: $color-invert;
        text-decoration: underline;
      }
    }
  }
}

.tag {
  border-radius: $radius;
}

.menu-list {
  a {
    transition: all 300ms ease;
  }
}

.modal-card-body {
  background-color: $grey-darker;
}

.modal-card-foot,
.modal-card-head {
  border-color: $grey-dark;
}

.message-header {
  font-weight: $weight-bold;
}

.message-body {
  border-width: $border-width;
  border-color: $grey;
}

.navbar {
  border-radius: $radius;

  &.is-transparent {
    background-color: transparent;
  }

  @include touch {
    .navbar-menu {
      background-color: inherit;
    }
  }

  @each $name, $pair in $colors {
    $color: nth($pair, 1);
    $color-invert: nth($pair, 2);

    &.is-#{$name} {
      @include touch {
        .navbar-item,
        .navbar-link {
          color: rgba($color-invert, 0.75);

          &.is-active {
            color: $color-invert;
          }
        }
      }
    }
  }
}

.pagination-link,
.pagination-next,
.pagination-previous {
  border-width: $border-width;
}

.panel-block,
.panel-heading,
.panel-tabs {
  border-width: $border-width;

  &:first-child {
    border-top-width: $border-width;
  }
}

.panel-heading {
  font-weight: $weight-bold;
}

.panel-tabs {
  a {
    border-width: $border-width;
    margin-bottom: -$border-width;

    &.is-active {
      border-bottom-color: $link-active;
    }
  }
}

.panel-block {
  &:hover {
    color: $link-hover;

    .panel-icon {
      color: $link-hover;
    }
  }

  &.is-active {
    .panel-icon {
      color: $link-active;
    }
  }
}

.tabs {
  a {
    border-bottom-width: $border-width;
    margin-bottom: -$border-width;
  }

  ul {
    border-bottom-width: $border-width;
  }

  &.is-boxed {
    a {
      border-width: $border-width;
    }

    li.is-active a {
      background-color: $background;
    }
  }

  &.is-toggle {
    li a {
      border-width: $border-width;
      margin-bottom: 0;
    }

    li + li {
      margin-left: -$border-width;
    }
  }
}





// Import Bulma and Buefy styles
@import "~bulma";
@import "~buefy/src/scss/buefy";


</style>

