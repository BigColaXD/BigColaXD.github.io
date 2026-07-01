const path = require("path");

hexo.extend.filter.register("before_post_render", function (data) {
  if (data.source && data.slug) {
    // 去掉 _posts/ 前缀，只取文件名（不含扩展名）
    const relative = data.source.replace(/^_posts[\\/]/, "");
    const basename = path.basename(relative, path.extname(relative));
    if (data.slug !== basename) {
      data.slug = basename; // 重设 slug 为纯文件名
    }
  }
  return data;
});
