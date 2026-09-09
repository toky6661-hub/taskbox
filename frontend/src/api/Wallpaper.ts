export async function getOnlineWallpaper(){

    try{

        const res =
        await fetch(
          '你的壁纸网站接口'
        )


        const data =
        await res.json()


        return data.url


    }catch(err){

        console.log(
          '在线壁纸获取失败',
          err
        )

        return null

    }

}