# Post-Comment-Nestjs
以 Nest.js 開發的貼文留言系統，可直接使用 Dockerfile 建立 container。

資料庫使用 MongoDB。

## Installation with Dockerfile
1. Set Up MongoDB Container (if you don't have one)
```
docker run --name mongo -p 27017:27017 -d mongo
```

2. Build docker Image
```
docker build .
```

3. Run Docker Image
<br>Replace `--link mongo:mongo` with your existing mongo container wtih `--link <your_mongo_container>:mongo`
```
docker run --name <name_provided> -p 3558:3558 --link mongo:mongo <image_hash>
```

## Installation with package managers
Example with `yarn` as below
1. Clone project
```
git clone <project> && cd <project>
```
2. Install packages
```
yarn 
```
3. Run app
<br>May modify .env.example at your discretion.
```
yarn start:prod
```

## Endpoints
### **API Documentation Page**
   - Method: `GET`
   - Route: `/api`

### **`Posts`**
#### **Get all posts**
   - Method: `GET`
   - Route: `/posts`

#### **Create a post**
   - Method: `POST`
   - Route: `/posts`

#### **Get top 10 most commented posts **
   - Method: `GET`
   - Route: `/posts/top10`

#### **Get a post**
   - Method: `GET`
   - Route: `/posts/{postDocId}`

#### **Delete a post**
   - Method: `DELETE`
   - Route: `/posts/{postDocId}`

#### **Update a post**
   - Method: `PUT`
   - Route: `/posts/{postDocId}`


### **`Comments`**
#### **Create a comment**
   - Method: `POST`
   - Route: `/posts/{postDocId}/comments`
   - Note about specifying targeting comment
     - May specify targeting comment with `commentDocId` in `request body`
     - If `commentDocId` is not specified, the created comment will be considered as `original comment` (樓主), thus included in `comments` field in its targeting post.
     - Otherwise, the created comment will be a child comment of its parent comment, but will not be included in `comments` field in its targeting post.

#### **Get comments by post**
   - Method: `GET`
   - Route: `/posts/{postDocId}/comments`

#### **Get comments by parent comment**
   - Method: `GET`
   - Route: `/posts/{postDocId}/comments/{commentDocId}`

#### **Update a comment**
   - Method: `PUT`
   - Route: `/posts/{postDocId}/comments/{commentDocId}`

#### **Delete a comment**
   - Method: `DELETE`
   - Route: `/posts/{postDocId}/comments/{commentDocId}`

