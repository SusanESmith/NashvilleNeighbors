'use strict'

module.exports = {
contentCleanUp : function(content) {
      content = content.replace(/\//g, ",");
      content = content.replace(/&/g, "and");
      return content;
    }
}
