# BME280_MH-Z19C_view

## 概要

データベース(MariaDB)に保存された気温・湿度・気圧・CO2濃度をWebアプリケーション形式で表示します。
[BME280_MH-Z19C_read_store](https://github.com/nmt-txt/BME280_MH-Z19C_read_store)により保存されたものが想定されています。

## 必要環境

- Node.js v20.11.1

## 使い方

各自の環境に合わせて、以下のファイルの書き換えが必要です

- `public/index.js`
	- fetch()で呼び出しているURL(2箇所)
- `db/db_pool.js`
	- DBのユーザ名、パスワード、データベース名

```console
$ npm install
$ node app.js
```