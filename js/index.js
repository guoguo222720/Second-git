// 放大镜
(function(){
    // 获取相关元素
    var zoomBox = document.querySelector('.zoom-box'); // 放大镜外层包裹元素
    var smallImageBox = zoomBox.querySelector('.small-image');// 小图包裹元素
    var largeImageBox = zoomBox.querySelector('.large-image');// 大图包裹元素
    var maskBox = zoomBox.querySelector('.mask-box');// 半透明蒙层

    // 监听鼠标进入小图的事件
    smallImageBox.onmouseenter=function(){
        // 蒙层显示
        maskBox.style.display="block";
        // 大图显示
        largeImageBox.style.display="block";
    };
    // 监听鼠标在小图区域移动事件
    smallImageBox.onmousemove=function(event){
        // 获取鼠标在小图上的位置 
        // 需要鼠标在视口上的位置 - 元素在视口上的位置
        var elex=event.clientX-smallImageBox.getBoundingClientRect().x;
        var eley=event.clientY-smallImageBox.getBoundingClientRect().y;
        // 让鼠标在蒙层中间而不是左上角
        elex -= maskBox.offsetWidth/2;
        eley -= maskBox.offsetHeight/2;
        // 限制一下蒙层位置范围
        if(elex<0){
            elex=0;
        }else if(elex>smallImageBox.clientWidth-maskBox.offsetWidth){
            elex=smallImageBox.clientWidth-maskBox.offsetWidth;
        }
        if(eley<0){
            eley=0;
        }else if(eley>smallImageBox.clientHeight-maskBox.offsetHeight){
            eley=smallImageBox.clientHeight-maskBox.offsetHeight;
        }

        // 调整蒙层位置
        maskBox.style.left=elex+"px";
        maskBox.style.top=eley+"px";

        // 调整大图的位置
        largeImageBox.scrollLeft=elex*2;
        largeImageBox.scrollTop=eley*2;
    };
    // 监听鼠标离开小图区域的事件
    smallImageBox.onmouseleave=function(){
        // 蒙层隐藏
        maskBox.style.display="none";
        // 大图隐藏
        largeImageBox.style.display="none";
    };
})();

// 商品预览缩略图
(function(){
    var prevBtn = document.querySelector('.thumb-box .thumb-prev');
    var nextBtn = document.querySelector('.thumb-box .thumb-next');
    var thumbWrapper = document.querySelector('.thumb-box .thumb-wrapper');   // 缩略图的包裹元素
    var thumbContent = document.querySelector('.thumb-box .thumb-content');   // 缩略图的包裹元素
    var smallImage = document.querySelector ('.zoom-box .small-image img');  // 小图元素
    var largeImage = document.querySelector('.zoom-box .large-image img');  // 大图元素

    // 根据数据 创建缩略图元素
    goodData.imgsrc.forEach(function(imgItem,index){
        // 创建 img 元素,并设置src
        var imgBox=new Image();
        imgBox.src=imgItem.s;
        // 创建自定义属性，手动把索引加到属性里去,方便后续实现大小图以及缩略图对应
        imgBox.dataset.index=index;
        // 将img元素添加到缩略图包裹元素中
        thumbWrapper.appendChild(imgBox);
    });

    // 计算一次缩略图移动的距离
    // 图片自身宽度
    var imgMove= thumbWrapper.firstElementChild.offsetWidth;
    // 图片右外边距
    var marginRight= parseInt(getStyle(thumbWrapper.firstElementChild,"marginRight"));
    // 移动总距离
    imgMove+=marginRight;
    // console.log(imgMove);

    // 记录上一次触发的时间
    prevBtn.time=0;
    // 点击上一个箭头
    prevBtn.onclick=function(event){
        // 防重复点击(事件节流)
        // 只有距离上一次事件的触发超过 400ms（大于left的过渡时长） 才能触发
        if(event.timeStamp-prevBtn.time<=400){
            return;
        }
        // 事件触发之后，更新触发时间
        prevBtn.time=event.timeStamp;

        // 方法一 实现滚动效果
        var left=thumbWrapper.offsetLeft+imgMove*2;
        // 判断有效范围
        if(left>0){
            left=0;
        };
        thumbWrapper.style.left=left+'px';
        // 方法二
        // thumbContent.scrollLeft-=imgMove*2;
    };
    // 记录上一次触发的时间
    nextBtn.time=0;
    // 点击下一个箭头
    nextBtn.onclick=function(event){
        // 防重复点击(事件节流)
        // 只有距离上一次事件的触发超过 400ms（大于left的过渡时长） 才能触发
        if(event.timeStamp-nextBtn.time<=400){
            return;
        }
        // 事件触发之后，更新触发时间
        nextBtn.time=event.timeStamp;

        // 方法一 实现滚动效果
        var left=thumbWrapper.offsetLeft-imgMove*2;
        // 判断有效范围
        if(left<imgMove*5-thumbWrapper.offsetWidth){
            left=imgMove*5-thumbWrapper.offsetWidth;
        };
        thumbWrapper.style.left=left+'px';
        // 方法二
        // thumbContent.scrollLeft+=imgMove*2;
    };

    // 通过事件委托给每个缩略图添加单击事件
    thumbWrapper.onclick=function(event){
        // 先判断点击的是img元素    
        if(event.target.nodeName==="IMG"){
            // 修改放大镜小图和大图的scr
            smallImage.src=goodData.imgsrc[event.target.dataset.index].s;
            largeImage.src=goodData.imgsrc[event.target.dataset.index].b;
        }
    };
})();

// 侧边栏选项卡
(function(){
    // 获取元素
    var tabNavItems = document.querySelectorAll('.product-siderbar .tab-nav-item');      
    var tabPanelItems =  document.querySelectorAll('.product-siderbar .tab-panel-item'); 
 
    // 调用函数实现选项卡
    tab(tabNavItems, tabPanelItems);
})();

// 商品详情选项卡
(function(){
    // 调用函数实现选项卡
    tab(document.querySelectorAll('#introTab .tab-nav-item'), document.querySelectorAll('#introTab .tab-panel-item'));
})();

// 商品参数选项
(function(){
    /*
        1. 商品参数选项对应价格变化
           1.1 根据参数选项的数据动态创建元素  dl dt dd
           1.2 dd 元素监听单击事件，点击选中，同组内排他
           1.3 点击 dd 元素，创建选中标签； 按照顺序；同组选项互相替换。
           1.4 点击选中标签的删除按钮，本身删除，对应的dd取消选中，且再选中所在组的第一个
           1.5 点击dd元素和选中标签元素，都会修改价格显示； 根据selectedArr数组中的选项进行价格计算
        2. 购买数量对应价格变化
           2.1 点击加减按钮数量变化，最小数量是1
           2.2 手动修改输入框中的数量，最小数量是1
           2.3 数量改变，价格变化
        3. 搭配商品 
           3.1 给每个搭配商品监听事件，如果选中将价格加入到总价上 如果取消选中从总价中减掉 
    */
 
    // 获取相应的元素
    var optionsBox = document.querySelector('#optionsBox');    // 参数选项的包裹元素
    var selectedBox = document.querySelector('#selectedBox');  // 选中标签元素的包裹元素
    var priceBox = document.querySelector('#priceBox');   // 显示价格的元素
    var numInput = document.querySelector('#numInput');   // 显示数量的输入框
    var plusBtn = document.querySelector('#plusBtn');     // 数量加 按钮
    var minusBtn = document.querySelector('#minusBtn');     // 数量减 按钮
    var masterPriceBox = document.querySelector('#masterPrice');  // 显示主商品价格
    var totalNumBox = document.querySelector('#totalNumBox');    // 显示搭配商品的数量
    var totalPriceBox = document.querySelector('#totalPrice');    //  显示总价
    var collectionInputs = document.querySelectorAll('#chooseProducts input');   // 所有搭配商品的复选框元素集合

    // 创建数组 用于保存被选中的选项
    var selectedArr = new Array(goodData.goodsDetail.crumbData.length);//数组数量长度的数组（4，有四个数组）
    // 定义变量 记录商品数量
    var productNum = 1;
    // 定义变量 记录搭配商品的总价
    var colloctionPrice = 0;
    // 定义变量 记录搭配商品的数量
    var collectionNum = 0;
 
    // 1.1 根据参数选项的数据动态创建元素  dl dt dd
    // 遍历参数选项的数据  创建dl元素、dt元素、dd元素
    goodData.goodsDetail.crumbData.forEach(function(dlItem, dlIndex) {
        // 创建 dl 元素
        var dlEle = document.createElement('dl');
        // 将 dl 元素添加 optionsBox 中
        optionsBox.appendChild(dlEle);
 
        // 创建 dt 元素
        var dtEle = document.createElement('dt');
        dtEle.innerHTML = dlItem.title;
        // 将 dt 元素添加到 dl 中
        dlEle.appendChild(dtEle);
 
        // 遍历每组中的选项数据 
        dlItem.data.forEach(function(ddItem,ddIndex){
            
            // 创建 dd 元素
            var ddEle = document.createElement('dd');
            ddEle.innerHTML = ddItem.type;
            // 设置自定义属性 记录dl的索引
            ddEle.dataset.groupIndex = dlIndex;
            // 设置自定义属性 记录该选项对应的价格变化
            ddEle.dataset.changePrice = ddItem.changePrice;
            // 如果是第一个选项，默认选中
            if (ddIndex === 0) {
                ddEle.classList.add('active');
            }
            // 将 dd 添加到 dl 中
            dlEle.appendChild(ddEle);
        });
    });
 
    //1.2 dd 元素监听单击事件，点击选中，同组内排他
    // 事件委托 给参数选项 dd 元素监听单击事件，委托给包裹元素 optionsBox
    optionsBox.onclick = function(event) {
        // 判断目标元素是 dd，才进行后续操作
        if (event.target.nodeName === 'DD') {
            // 同组内排他
            // 同一个 dl 中的其他 dd 取消选中
            var siblingEles = event.target.parentElement.children;
            // 从1开始是因为0为dt，而我们只需要dd
            for (var i = 1; i < siblingEles.length; i ++) {
                siblingEles[i].classList.remove('active');
            }
 
            // 当前点击的 dd 被选中
            event.target.classList.add('active');
 
            // 将当前的选项元素添加到数组中
            selectedArr[event.target.dataset.groupIndex] = event.target;
             
            // 1.3 点击 dd 元素，创建选中标签； 按照顺序；同组选项互相替换。
            // 调用函数 创建 selectedTag 选中标签元素
            createSelectedTag();
 
            // 1.5 点击dd元素和选中标签元素，都会修改价格显示； 根据selectedArr数组中的选项进行价格计算
            // 调用函数修改价格
            changePrice();
        }
    };

    // 1.4 点击选中标签的删除按钮，本身删除，对应的dd取消选中，且再选中所在组的第一个
    // 事件委托 给选中标签元素上的关闭按钮监听事件，委托给包裹元素 selectedBox
    selectedBox.onclick = function(event) {
        // 判断点击的是关闭按钮
        if (event.target.className === 'close') {
           // 删除所在的选中标签元素
           selectedBox.removeChild(event.target.parentElement);
            
           // 对应的 dd 取消选中，并默认选中每组的第一个
           // 从数组中取出与当前选中标签对应的dd元素
           var ddEle = selectedArr[event.target.parentElement.dataset.index];
           ddEle.classList.remove('active');   // 当前的dd取消选中
            // 之所以索引是1，是因为0索引是dt
           ddEle.parentElement.children[1].classList.add('active');  // 同组的第一个dd选中
 
           // 把当前的 dd 从数组中删除
           delete selectedArr[event.target.parentElement.dataset.index];
 
            //    1.5 点击dd元素和选中标签元素，都会修改价格显示； 根据selectedArr数组中的选项进行价格计算 
           // 调用函数修改价格
            changePrice();
        }
    };

    // 2.1 点击加减按钮数量变化，最小数量是1
    // 点击数量加按钮
    plusBtn.onclick = function() {
        // 数量累加
        productNum ++;
        // 修改输入框的值
        numInput.value = productNum;
        // 重新计算价格
        changePrice();
    };
 
    // 2.1 点击加减按钮数量变化，最小数量是1
    // 点击数量减按钮
    minusBtn.onclick = function() {
        // 数量累减
        productNum --;
        // 判断数量不能小于 1
        if (productNum < 1) {
            productNum = 1;
        }
        // 修改输入框的值
        numInput.value = productNum;
        // 重新计算价格
        changePrice();
    };
 
    // 2.2 手动修改输入框中的数量，最小数量是1
    // 监听到数量输入框有所变换（值改变且失去焦点）
    numInput.onchange = function() {
        // 获取输入框的值
        productNum = +numInput.value;
        // 判断如果是无效
        if (isNaN(productNum) || productNum < 1) {
            productNum = 1;
        }
        // 修改输入框的值
        numInput.value = productNum;
        // 重新计算价格
        changePrice();
    };
 
    // 3.1 给每个搭配商品监听事件，如果选中将价格加入到总价上 如果取消选中从总价中减掉 
    // 给每个搭配商品的复选框监听 change 事件
    collectionInputs.forEach(function(collectionInput) {
        collectionInput.onchange = function() {
            if (collectionInput.checked) {
                // 选中了该搭配商品
                colloctionPrice += (+collectionInput.value);
                // 搭配商品数量++
                collectionNum ++;
            } else {
                // 取消选中该搭配商品
                colloctionPrice -= (+collectionInput.value);
                collectionNum --;
            }
            // 修改价格显示
            changePrice();
            // 显示搭配商品数量
            totalNumBox.innerHTML = collectionNum;
        };
    });
 
 
    // 1.3 点击 dd 元素，创建选中标签； 按照顺序；同组选项互相替换。
    /**
     * 根据数组 selectedArr 创建 selectedTag 选中标签元素
    */
    function createSelectedTag() {
        // 清空选中标签的包裹元素
        selectedBox.innerHTML = '';
 
        // 遍历 selectedArr 数组
        selectedArr.forEach(function(ddEle, index){
            // 创建选中标签元素 添加到 selectedBox
            var selectedEle = document.createElement('div');
            selectedEle.className = 'selected-tag';
            selectedEle.innerHTML = ddEle.innerHTML + '<span class="close">×</span>';
            selectedEle.dataset.index = index;
            selectedBox.appendChild(selectedEle);
        });
    }
 
    // 1.5 点击dd元素和选中标签元素，都会修改价格显示； 根据selectedArr数组中的选项进行价格计算
    /**
     * 计算商品的价格 
    */
    function changePrice() {
        // 获取主商品基础价格
        var price = goodData.goodsDetail.price;
 
        // 根据 selectedArr 中的选中的选项 修改单价
        selectedArr.forEach(function(ddEle) {
            // 加加号是为了进行数据类型转换，将字符串转换为数字
            price += (+ddEle.dataset.changePrice);
        });
 
        // 计算主商品的总价
        var masterPrice = price * productNum;
 
        // 修改显示价格
        priceBox.innerHTML = masterPrice;
        masterPriceBox.innerHTML = '¥' + masterPrice;
        // 商品价格+搭配商品价格
        totalPriceBox.innerHTML = '¥' + (masterPrice + colloctionPrice);
    }
})();

 
// 固定侧边导航栏
(function() {
    // 获取元素 
    var pageSierbar = document.querySelector('#pageSierbar');
    var menuBtn = document.querySelector('#menuBtn');
    var topBtn = document.querySelector('#topBtn');
 
    // 点击菜单按钮
    menuBtn.onclick = function() {
        pageSierbar.classList.toggle('open');
    };
 
    // 点击返回顶部
    topBtn.onclick = function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };
 
})();