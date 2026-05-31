# Minimal Academic Homepage

这是一个极简学术个人主页模板，适合直接部署到 GitHub Pages。

## 日常更新

之后主要改这个文件：

```text
index.md
```

姓名、职位、简介、论文、教学和联系方式都在 `index.md` 里。页面标题和站点名也可以在 `_config.yml` 里改。

## 部署到 GitHub Pages

1. 新建一个 GitHub 仓库，例如 `yourname.github.io`。
2. 上传本文件夹里的所有文件。
3. 在仓库设置里打开 Pages，选择 GitHub Actions 或 `main` 分支部署。

GitHub Pages 会自动用 Jekyll 把 `index.md` 渲染成网页。

## 文件结构

```text
_config.yml          站点配置
_layouts/default.html 页面骨架
assets/style.css     极简样式
index.md             你的个人主页内容
```

## 修改导航

顶部导航目前对应这些二级标题：

- About
- Research
- Publications
- Teaching
- Contact

如果要改成中文导航或增删栏目，编辑 `_layouts/default.html` 里的 `<nav>`。
