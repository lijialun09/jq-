$(function () {
    //	最开始加载的背景音效
	var audio_bg  = document.getElementById('audio_bg');
	var audio_bg2 = document.getElementById('audio_bg2');
	var audio_jiao  = document.getElementById('audio_jiao');
    // 延迟显示人物
    setTimeout(function(){
        $('.role_left').css({'opacity':'1','top':'210px'});
        $('.role_right').css({'opacity':'1','top':'210px'});
        setTimeout(function(){
        	$('.role_left img').css({'opacity':'1','top':'6px'});
        	$('.role_right img').css({'opacity':'1','top':'20px'});
        	setTimeout(function(){
        		$('.role_mid').css({'opacity':'1','left':'-600px','transform': 'scale(.8)'});
        	},1000);
        },1180);
    },500);

    // 延迟显示牌堆



    // 1.初始化牌堆
    for (var i = 0; i < 54; i++) {
        $('.all_poker').append('<li class="back" style="top:-' + i + 'px;"></li>');
    }

    //定义一个记录点击次数的值
    var click = 0;

    // 定义一个倒计时的值
    var $timmer           //  倒计时定时器
    var $lasttime = 25;

    // 为405行服务,记录叫地主 抢地主的次数   和  记录倍数的值
    var $jiao = 0;     
    var $bei  = 15;
    // var landlord = 0;    //  记录叫地主   403行 526行

    //这里联系630行，为出牌后的即时排序问题服务
    // 初始化牌堆数据
    /*
        由于扑克牌每张牌都包含两种数据，所以在设计数据结构的时候需要把一个数据看成两个值，然后把数据设计成下面这样:
        方块1  => 1_0 		梅花1 => 1_1		数据结构			点数_花色
    */
    var all_poker_data = ['14_0', '14_1'];     //14_0,14_1 分别为大小王
    for (var i = 1; i < 14; i++) {
        for (var j = 0; j < 4; j++) {
            all_poker_data.push(i + '_' + j);
        }
    }
    // console.log(all_poker_data);

    // 初始化玩家数据
    var all_play = [];
    // 由于玩家数据可能有很多个不同方向的内容，所以我们使用对象来进行保存
    all_play.push({ name: '阳光少年', intergral: 1000, role: null, poker: [] });
    all_play.push({ name: '乖巧萌妹', intergral: 1000, role: null, poker: [] });
    all_play.push({ name: '猥琐大叔', intergral: 1000, role: null, poker: [] });
    //  由于玩家数据可能右很多个不同方向的内容，所以我们使用对象来进行保存
    // var play_1 = { name: '阳光少年', intergral: 1000, role: null, poker: [] };       //intergral为积分
    // var play_2 = { name: '乖巧萌妹', intergral: 1000, role: null, poker: [] };
    // var play_3 = { name: '猥琐大叔', intergral: 1000, role: null, poker: [] };

    // console.log(all_poker_data);

    // 空数组，用来存在准备出的牌的数据
    var ready_poker = { poker: [], type: 0, max: 0 };

    // console.log(typeof ready_poker.max);
    // 初识话桌面上的牌型
    var desktop_poker = { poker: [], type: 0, max: 0 };

    // 存放上一次出牌的牌
    var temporary   = { poker:[]};

    // console.log(typeof desktop_poker.max);
    // 初始化当前的游戏状态   boss代表地主，player代表当前出牌玩家
    var game_status = { boss: -1, player: -1, cancle: 0 };

    function test() {
        console.log('ready_poker.poker:  ' + ready_poker.poker);
        console.log('ready_poker.type:   ' + ready_poker.type);
        console.log('ready_poker.max:    ' + ready_poker.max);
        console.log('desktop_poker.poker:' + desktop_poker.poker);
        console.log('desktop_poker.type: ' + desktop_poker.type);
        console.log('desktop_poker.max:  ' + desktop_poker.max);
    }
    // 玩家准备出的牌

    // 此处搬迁(原为play 1 2 3的li绑定代码)，现  在552行 

    // 2.点击洗牌，绑定洗牌事件 ,使用冒泡绑定的方式
    // $('.all_poker li').click(function(){
    $('body').on('click', '.all_poker li', function () {
        if (click <= 0) {
            // 洗牌的方法
            clearPoker();   // 调用洗牌的方法
            click++;
        } else if (click == 1) {
            deal(0);      // 调用发牌的方法
            click++;      // 最后当对局结束应当把该值还原

            setTimeout(function () {
                getBoss();
            }, 4000);
        }
    });
    // console.log(0.5-Math.random())
    // console.log(all_poker_data)
    // 定义一个洗牌的动画
    function clearPoker() {

        // 洗牌对电脑来说就是把数组里面的数据顺序打乱
        for (var i = 0; i < 2; i++) {
            all_poker_data.sort(function () {
                return 0.5 - Math.random();//0-1之间的随机数，不包括0和1；
                // console.log(0.5-Math.random())
            });
        }

        // console.log(all_poker_data);

        // 存储牌堆数据，用于还原
        var all_poker = $('.mid_top').html();
        // console.log(all_poker);

        // 洗牌的过程
        // 1.删除原来的牌
        $('.all_poker').remove();

        // 2.生成三队临时的牌用于洗牌动画
        for (var i = 0; i < 3; i++) {
            // 通过jq生成页面ul元素对象
            var $ul = $('<ul />').attr('class', 'all_poker').css({ top: -i * 275 + 'px' });

            // 通过循环的到分为3份的54张牌.
            for (var j = 0; j < 18; j++) {
                var $li = $('<li />').attr('class', 'back').css({ top: -j + 'px' })
                // 将煤个li添加到ul中去
                $ul.append($li);
            }

            //  将ul添加到顶部的div中去
            $('.mid_top').append($ul);
        }

        // 洗牌动画
        for (var i = 0; i < 3; i++) {
            $('.all_poker').eq(0).animate({ left: '-300px' }, 200).animate({ left: '0px' }, 200);
            $('.all_poker').eq(1).animate({ left: '300px' }, 200).animate({ left: '0px' }, 200);
        }

        // 把牌堆还原
        setTimeout(function () {
            $('.mid_top').html(all_poker);
        }, 1300)
    }

    // 定义一个发牌的方法
    function deal(number) {
        //  发牌给左边的玩家
        $('.all_poker li:last').animate({ left: '-650px', top: '200px' }, 20);

        setTimeout(function () {
            // 删除最后一张牌
            $('.all_poker li:last').remove();

            // var aaa = all_poker_data.pop();
            // console.log(aaa);
            // 把删除的最后一个数据插入到数组里面
            all_play[0].poker.push(all_poker_data.pop());
            // console.log(all_play[0].poker);
            // console.log(all_play[0].poker.length);

            // 通过调用makePoker （） 这个方法显示牌面，并且传入数据中心最新的那张牌的数据的到该数据牌面的html代码
            var poker_html = makePoker(all_play[0].poker[all_play[0].poker.length - 1]);
            // console.log(play_1.poker);
            // console.log(play_1.poker.length);
            $('.play_1').append(poker_html);
            $('.play_1 li:last').css({ top: number * 20 + 'px' });
            $('.play_1').css({ top: 0 * number + 'px' });

        }, 30);

        // 发牌给中间的玩家
        setTimeout(function () {
            $('.all_poker li:last').animate({ top: '500px' }, 20);

            setTimeout(function () {
                $('.all_poker li:last').remove();

                // 把牌堆中最后一张牌的数据添加到玩家2的数据中，并删除
                all_play[1].poker.push(all_poker_data.pop());
                // console.log(all_play[1].poker);
                // console.log(all_play[1].poker.length);

                // 通过调用makePoker （） 这个方法显示牌面，并且传入数据中心最新的那张牌的数据的到该数据牌面的html代码
                var poker_html = makePoker(all_play[1].poker[all_play[1].poker.length - 1]);
                // console.log(play_2.poker);
                // console.log(play_2.poker.length);
                $('.play_2').append(poker_html);
                $('.play_2 li:last').css({ left: number * 20 + 'px' });
                $('.play_2').css({ left: -10 * number + 'px' });


            }, 30);

        }, 40);

        // 发牌给右边的顽疾
        setTimeout(function () {
            $('.all_poker li:last').animate({ left: '650px', top: '200px' }, 20);

            setTimeout(function () {
                $('.all_poker li:last').remove();
                all_play[2].poker.push(all_poker_data.pop());          //

                // console.log(all_play[2].poker);
                // console.log(all_play[2].poker.length);

                // 通过调用makePoker （） 这个方法显示牌面，并且传入数据中心最新的那张牌的数据的到该数据牌面的html代码
                var poker_html = makePoker(all_play[2].poker[all_play[2].poker.length - 1]);
                // console.log(play_3.poker);
                // console.log(play_3.poker.length);
                $('.play_3').append(poker_html);
                $('.play_3 li:last').css({ top: number * 20 + 'px' });
                $('.play_3').css({ top: 0 * number + 'px' });

                number++;
                if (number < 17) {
                    deal(number);
                } else {
                    // 进行发牌后结束后的流程
                    // 得到排序完的数据
                    all_play[0].poker = sortPoker(all_play[0].poker);
                    all_play[1].poker = sortPoker(all_play[1].poker);
                    all_play[2].poker = sortPoker(all_play[2].poker);

                    // console.log(play_2.poker);
                    setTimeout(function () {
                        // 等待2秒的时间，把玩家的牌变成背面
                        $('.play_1 li').attr('class', 'back').css({ background: '' });
                        $('.play_2 li').attr('class', 'back').css({ background: '' });
                        $('.play_3 li').attr('class', 'back').css({ background: '' });

                        setTimeout(function () {
                            // 删除当前的li
                            $('.play_1 li').remove();
                            $('.play_2 li').remove();
                            $('.play_3 li').remove();

                            // 循环里面每一个值，传到makepoker里面
                            for (var i = 0; i < all_play[1].poker.length; i++) {
                                var temp_li1 = makePoker(all_play[0].poker[i]);
                                var temp_li2 = makePoker(all_play[1].poker[i]);
                                var temp_li3 = makePoker(all_play[2].poker[i]);

                                //  得到返回值，添加到Html中
                                $('.play_1').append(temp_li1);
                                $('.play_2').append(temp_li2);
                                $('.play_3').append(temp_li3);

                                // 调整位置
                                $('.play_1 li:last').css({ top: i * 20 + 'px' });
                                $('.play_2 li:last').css({ left: i * 20 + 'px' });
                                $('.play_3 li:last').css({ top: i * 20 + 'px' });

                                $('.all_poker .back').eq(0).animate({ left: '-130px' }, 300);
                                $('.all_poker .back').eq(1).animate({ top: '-2px' }, 200);
                                $('.all_poker .back').eq(2).animate({ left: '130px', top: '0px' }, 300);

                            }
                        }, 800);

                    }, 1000);

                }
            }, 30);

        }, 80)
    }

    // 定义一个生产HTML代码的方法
    function makePoker(poker) {
        // console.log(poker);
        // 用函数使_ 做分隔符来切割
        var poker_arr = poker.split('_');
        // console.log(poker_arr);

        var color_arr = [
            [-17, -224], 	//方块花色坐标
            [-17, -5],		//梅花
            [-160, -5],		//红桃
            [-160, -224]		//黑桃
        ];

        if (poker_arr[0] != 14) {// 牌不是大小王的化，牌面背景生产的方法
            // 通过花色的值与花色的坐标数组确定牌型X方向的坐标值
            var x = color_arr[poker_arr[1]][0];
            // console.log(x[0]);

            // 通过花色的值与花色的坐标数组确定牌型X方向的坐标值
            var y = color_arr[poker_arr[1]][1];

        } else {
            if (poker_arr[1] == 0) {
                // 小王
                var x = -160;
                var y = -5;
            } else {
                // 大王
                var x = -17;
                var y = -5;
            }
        }

        return '<li style="width: 125px; height: 175px; background: url(./images/' + poker_arr[0] + '.png) ' + x + 'px ' + y + 'px;" data-value="' + poker + '"></li>';

    }

    // 定义一个生产出牌HTML代码的方法
    function newmakePoker(poker) {
        // console.log(poker);
        // 用函数使_ 做分隔符来切割
        var poker_arr = poker.split('_');
        // console.log(poker_arr);

        var color_arr = [
            [-17, -224], 	//方块花色坐标
            [-17, -5],		//梅花
            [-160, -5],		//红桃
            [-160, -224]		//黑桃
        ];

        if (poker_arr[0] != 14) {// 牌不是大小王的化，牌面背景生产的方法
            // 通过花色的值与花色的坐标数组确定牌型X方向的坐标值
            var x = color_arr[poker_arr[1]][0];
            // console.log(x[0]);

            // 通过花色的值与花色的坐标数组确定牌型X方向的坐标值
            var y = color_arr[poker_arr[1]][1];

        } else {
            if (poker_arr[1] == 0) {
                // 小王
                var x = -160;
                var y = -5;
            } else {
                // 大王
                var x = -17;
                var y = -5;
            }
        }

        return '<li style="width: 125px; height: 175px; background: url(./images/' + poker_arr[0] + '.png) ' + x + 'px ' + y + 'px;" data-value="' + poker + '"></li>';

    }

    //  倒计时的函数
    function timeout(thar) {
        // $lasttime = 25;
        clearInterval($timmer);
        $timmer = setInterval(function () {
            // 传进来的thar 即game_status.player
            if ($lasttime != 1) {
                $lasttime--;
                $('.last_time').eq(thar).html($lasttime);
                //  当倒计时5秒时 ，显示闹钟控件
                if ($lasttime == 5) {
                    $('.clock' + (thar + 1)).css('display', 'block');
                }
            } else {
                $lasttime = 25;
                $('.last_time').eq(thar).html(25);
                $('.icon_time').eq(thar).css('display', 'none');
                $('.clock' + (thar + 1)).css('display', 'none');
                clearInterval($timmer);
            }
        }, 1000);
        // console.log($('.last_time'));
    }

    // 定义一个排序的方法
    function sortPoker(poker) {
        // console.log(poker);

        poker = poker.sort(function (x, y) {
            var x_arr = x.split('_');
            var y_arr = y.split('_');
            // console.log(x, y)
            // console.log(x_arr, y_arr)

            // console.log(y_arr);

            // 先判断牌的点数
            if (x_arr[0] != y_arr[0]) {//点数不相同，使用点数进行排序
                return y_arr[0] - x_arr[0];
            } else {
                // 点数相同，使用花色排序
                return y_arr[1] - x_arr[1];
            }
        });

        return poker;
    }

    // 定义抢地主的函数
    function getBoss(start, cancle) {
        cancle = cancle || 1;
        // console.log(cancle);
        if (cancle > 3) {
            alert('扑街，都不抢地主，不玩了!!!');
            window.location.reload();
            return false;
        }

        // 一开始叫地主按钮是随机抽取
        if (start == undefined) {
            start = Math.round(Math.random() * 2);
        }

        // 先把所有的玩家叫地主的组件隐藏
        $('.getBoss').hide();

        // 把开始叫地主的人的页面组件显示
        $('.getBoss').eq(start).show();

        // 记录随机给玩家叫地主的数
        var $boss = start;        //地主
        var $min,$max;    //农民1号
        
        
        // 绑定叫地主的按钮方法
//      $('.getBoss').eq($boss).find('img').eq(0).click(function () {
//          
//          // 第一次叫并隐藏自己  轮到下一家叫
//          $('.getBoss').eq($boss).hide();
//          console.log($boss);
//          ++$jiao; 
//          $bei  = $bei * 2;  //加倍
//          $min = ++$boss>2? $boss = 0:$boss;
////          $min  = $boss;
//          console.log($boss);
//          console.log($min);
//          // 改变为抢地主按钮
//          $('.getBoss').eq($min).show().find('img').eq(0).attr('src','./斗地主图片/按钮成品/28.png');
//          // 倍数加倍
//          $('.multiple span').html($bei);
//          // if($jiao == )
//      });
        // $min的叫地主
//      $('.getBoss').eq($min).find('img').eq(0).click(function () {
//      	console.log($min);
//          // 第一次叫并隐藏自己  轮到下一家叫
//          $('.getBoss').eq($min).hide();
//          ++$jiao; 
//          $bei  = $bei * 2;  //加倍
//          $max = ++$min>2? $min = 0:$min;
//          console.log($max);
//          // 改变为抢地主按钮
//          $('.getBoss').eq($max).show().find('img').eq(0).attr('src','./斗地主图片/按钮成品/28.png');
//          // 倍数加倍
//          $('.multiple span').html($bei);
//      });

        // 当点击地主的按钮轮完第三家
           $('.getBoss').eq(start).find('img').eq(0).click(function () {
           	   audio_bg.pause();
               var audio = document.createElement('audio'); 
               audio.loop = 'loop';
               audio.id ='bg2';
               audio.src ='audio/Audio_Game_Back.ogg';
               audio.play();
               // 点击叫地主隐藏所有按钮
               $('.getBoss').hide();
               
               ++$jiao; 
               $bei  = $bei * 2;  //加倍
               $('.multiple span').html($bei);

               // 通过点击得到的那个玩家抢地主的值来判断谁当地主
               var value = Number($(this).attr('data-value'));//2
            
               // 为聊天框服务，哪个抢到地主了，标记一个地主属性 .见1592行
               $(this).attr('data-dizhu','1');
               $('.getBoss').eq(start).attr('data-boss','1');
               // console.log($(this).attr('data-dizhu'));
               console.log($('.getBoss').eq(start).attr('data-boss'));
               // console.log($('.getboss').find('img').eq(0).attr('data-dizhu'));


               all_play[value - 1].role = 1;
               game_status.boss = value - 1;
               game_status.player = value - 1;
               all_play[game_status.boss].poker = all_play[game_status.boss].poker.concat(all_poker_data);

               console.log(all_play[game_status.boss].poker);   //  已加入地主牌 但未排序的牌

               // 把剩下的三张牌翻开
               $('.all_poker li').remove();
               for (var i = 0; i < 3; i++) {
                   var temp_li = makePoker(all_poker_data[i]);
                   $('.all_poker').append(temp_li);

                   // 把最后的牌给地主玩家
                   // if(all_play[0].role == 1){}
                   // if(all_play[1].role == 1){}
                   // if(all_play[2].role == 1){}
                   $('.play_' + (game_status.boss + 1)).append(temp_li);
                   $('.play_' + (game_status.boss + 1) + ' li:last').css({ left: 325 + 18 * (i + 1) + 'px' });
               };

               $('.all_poker li').eq(0).animate({ left: '-150px' }, 200).animate({ left: '-80px', top: '-50px' }).css({'transform':'scale(.5)'});
               $('.all_poker li').eq(1).animate({ left: '150px' }, 200).animate({ left: '80px', top: '-50px' }).css({'transform':'scale(.5)'});
               $('.all_poker li').eq(2).animate({ left: '0px' }, 200).animate({ left: '0px', top: '-50px' }).css({'transform':'scale(.6)'});

               $('.all_poker .shengzhi').css({'transform':'scale(1)'});
               $('.all_poker').css({'transition':'all .5s linear'});        // 这句可选

               // 由于地主牌刷新了牌堆，所以需要重新排序，在执行一次排序动画
               setTimeout(function () {
                   // 记得打空格...
                   $('.play_' + (game_status.boss + 1) + ' li').css({ background: '' }).attr('class', 'back');

                   // 获取当前地主的牌，并排序
                   all_play[game_status.boss].poker = sortPoker(all_play[game_status.boss].poker);
                   // console.log(all_play[game_status.boss].poker);

                   setTimeout(function () {
                       $('.play_' + (game_status.boss + 1) + ' li').remove();

                       for (var i = 0; i < all_play[game_status.boss].poker.length; i++) {
                           var temp_li = makePoker(all_play[game_status.boss].poker[i]);
                           $('.play_' + (game_status.boss + 1)).append(temp_li);
                           if ((game_status.boss + 1) != 2) {
                               $('.play_' + (game_status.boss + 1) + ' li:last').css({ top: 20 * i + 'px' });
                           } else {
                               $('.play_' + (game_status.boss + 1) + ' li:last').css({ left: 20 * i + 'px' });
                           }

                       }

                       //  放出牌的区域
                       $('.show_poker').css('display', 'block');
                    //    猫显示
                       $('.Marker .miao').css('transform','scale(1)');
                       setTimeout(function(){
                           $('.Marker .mark').css({'top':'0px','opacity':'1'});
                           setTimeout(function(){
                            //    刀显示
                               $('.dao').css({'top':'-45px','opacity':'1'});
                               setTimeout(function(){
                                //    记牌的字数显示
                                   $('.jipai_font').css('opacity','1');
                               },1180);
                           },750);
                       },400);

                       // $('.boss_pic').css('display', 'block');

                       //  记牌器 显示位
                       // $('记牌器').css('display','block');

                       // 已经结束抢地主阶段，进入出牌游戏阶段
                       startGame();
                   }, 240)

               }, 500);

           })
        


        // console.log(start);

        // 绑定不叫地主的按钮
        $('.getBoss').eq(start).find('img').eq(1).click(function () {
            // alert(1);
            // 判断如果start状态值大于2就为0，如果没有大于2就直接赋值
            start = (++start > 2) ? 0 : start;
            getBoss(start, cancle + 1);
        });
    }

    // 开始出牌的方法
    function startGame() {
        // 出牌  音效
        // 把所有的出牌组件隐藏
        $('.action').hide();

        // 把去掉装倒计时的控件display显现回来
        $('.icon_time').eq(game_status.player).css('display', 'inline-block');

        //  积分显示位
        // $('积分').css('display','block');

        //  倍数显示位
        // $('倍数').css('display','block');

        // 这里改进了，地主第一次出牌不显示不出组件
        //      $('.action').eq(game_status.player).show();
        if (all_play[game_status.boss].poker.length == 20) {
            $('.action').eq(game_status.player).show();
            $('.action .no').eq(game_status.boss).hide();
        } else {
            $('.action').eq(game_status.player).show();
            $('.action .no').eq(game_status.boss).show();
        }

        // 多添加的出牌倒计时   见395行
        timeout(game_status.player);
        // console.log(game_status.player);

        //解绑选中牌事件    还有630行
        $('play_poker').off('click', 'li');

        //绑定选中事件    给li牌添加点击事件，函数触发
        $('.play_' + (game_status.player + 1)).on('click', 'li', function () {       // 出牌按钮处605行，这里还只是挑牌出阶段
            console.log(game_status.player + 1);
            // 区分 中间玩家与两边玩家
            if ((game_status.player + 1) != 3 && (game_status.player + 1) != 2) {
                var left = $(this).css('left');

                if (left != '-20px') {
                    $(this).css('left', '-20px');
                    ready_poker.poker.push($(this).attr('data-value'));
                } else {
                    $(this).css('left', '0px');
                    // 找到牌的数据
                    var index = ready_poker.poker.indexOf($(this).attr('data-value'));   //  这里找索引删除没毛病
                    //          console.log(index);      
                    // 删除这条数据
                    ready_poker.poker.splice(index, 1);
                }

            } else if ((game_status.player + 1) != 1 && (game_status.player + 1) != 3) {
                // 把现在的数据获取到
                var top = $(this).css('top');

                if (top != '-20px') {
                    $(this).css({ 'top': '-20px' });
                    ready_poker.poker.push($(this).attr('data-value'));
                    console.log("play_2的attr('data-value'):  " + $(this).attr('data-value'));
                    console.log('play_2的ready_poker.poker:   ' + ready_poker.poker);
                    console.log('play_2的ready_poker.max:     ' + ready_poker.max);
                } else {
                    // 找到牌的数据
                    $(this).css({ 'top': '0px' });
                    var index = ready_poker.poker.indexOf($(this).attr('data-value'));   //  这里找索引删除没毛病
                    console.log(index);
                    // 删除这条数据
                    ready_poker.poker.splice(index, 1);

                    // console.log(ready_poker.poker);
                }
            } else if ((game_status.player + 1) != 1 && (game_status.player + 1) != 2) {
                // 把现在的数据获取到
                var right = $(this).css('right');

                if (right != '-20px') {
                    $(this).css({ 'right': '-20px' });
                    ready_poker.poker.push($(this).attr('data-value'));
                    console.log("play_2的attr('data-value'):  " + $(this).attr('data-value'));
                    console.log('play_2的ready_poker.poker:   ' + ready_poker.poker);
                    console.log('play_2的ready_poker.max:     ' + ready_poker.max);
                } else {
                    // 找到牌的数据
                    $(this).css('right', '0px');
                    var index = ready_poker.poker.indexOf($(this).attr('data-value'));    //  这里找索引删除没毛病
                    //          console.log(index);      
                    // 删除这条数据
                    ready_poker.poker.splice(index, 1);

                    // console.log(ready_poker.poker);
                }

            }

            // console.log(ready_poker.max);
            // console.log(desktop_poker.max);
            // console.log(desktop_poker.poker.length);
            // console.log(ready_poker.poker.length);
        });

        // console.log(all_play[game_status.boss].poker.length);

        // 解绑出牌事件
        $('.action').eq(game_status.player).off('click', '.play').off('click', '.no');

        // 绑定出牌事件
        $('.action').eq(game_status.player).find('img').eq(0).click(function () {
            // alert('哆啦A梦');
            // 判定是否是炸弹
            // if(ready_poker.poker[0].substr(0,1))
            
            //  可选 !!!    出牌后把地主牌隐藏
            $('.all_poker').css({'transform':'scale(0)'});
            $('.all_poker .shengzhi').css({'transform':'scale(0)'});

            // 点击了出牌后把闹铃去掉
            $('.clock' + (game_status.player + 1)).css('display', 'none');

            // console.log(game_status.player);
            // 在判断牌型之前需要对数据进行排序
            ready_poker.poker = sortPoker(ready_poker.poker);     //这里排序方法内传入参数见53行  函数在393行
            
            console.log(ready_poker.poker);
            var a;
            var poker_num =4;
            var poker_num_vip =2;
            // 把出的牌在记牌器中去掉
            for(let i=0;i<ready_poker.poker.length;i++){
                console.log(ready_poker.poker.length);
                a = ready_poker.poker[i].substr(0,1);
                console.log(a);
                if(a<=13){
                    $('.span'+a).html(--poker_num);
                }else{
                    $('.span'+a).html(--poker_num_vip);
                }
            }
            // 调用一个函数专门用于判断是否能出牌
            if (!checkPokers(ready_poker.poker)) {    // 函数方法757行
                alert('好丢人，你出的牌不符合规则..');
            } else if (!pokerVs()) {                  // 函数方法1235行
                alert('你打不过人家，快收回来~~~');
            } else {
                // 出牌的完整流程
                $('.show_poker .poker_li li').remove();   // 此语句用来清空下一位玩家出牌时上一位玩家桌面的牌
                // 1.把桌面的牌换成玩家选择的牌

                desktop_poker.type = ready_poker.type;
                desktop_poker.max = ready_poker.max;

                console.log('桌面牌换玩家牌 ready_poker.type:  ' + ready_poker.type);
                console.log('桌面牌换玩家牌 ready_poker.max:   ' + ready_poker.max);
                for (var i = 0; i < ready_poker.poker.length; i++) {
                    //   这里存储已出牌的数组的poker! 注意只是poker! 也要初始化
                    // desktop_poker.poker = [];

                    desktop_poker.poker.push(ready_poker.poker[i]);
                    console.log('desktop_poker.poker:    ' + desktop_poker.poker);

                    // 玩家出牌后把玩家牌堆中对应的数据进行删除
                    var index = all_play[game_status.player].poker.indexOf(ready_poker.poker[i]);
                    // console.log(index);                             千万呀!!!!!!!!!        千万别打开这里的注释，包括楼下的662，不然 整理牌顺序的时候会失效!!!!!

                    all_play[game_status.player].poker.splice(index, 1);
                    // console.log(all_play[game_status.player].poker.splice(index, 1));  千万别打开!!!!  不然我会打死在座的各位， 包括楼主的659 不然 整理牌顺序的时候会失效!!!!!

                    //  把出的牌添加到出牌区域
                    $('.play_' + (game_status.player + 1) + ' li').each(function () {// 遍历出牌玩家牌堆 注意这里已是第二层循环
                        if ($(this).attr('data-value') == ready_poker.poker[i]) {
                            // console.log($(this).attr('data-value'));

                            $(this).remove();   //这是已完成出牌后的后续操作  出牌玩家临时牌堆数据里与所选牌的标记值的牌相等则删除玩家手牌

                            //把出的牌展示在收纳牌堆的区域
                            var poker_html = newmakePoker($(this).attr('data-value'));
                            // console.log(play_2.poker);
                            // console.log(play_2.poker.length);
                            $('.show_poker .poker_li').append(poker_html);
                            // 给ul居中，根据出的牌的张数
                            $('.show_poker .poker_li').css({left: i * (-10)+'px'});
                            $('.show_poker .poker_li li:last').css({ left: i * 18 + 'px', transform: 'rotateZ(5deg)' });
                            // $('.show_poker .poker_li li').eq(i).css({ left: i * -10 + 'px' });
                            // $('.desk_poker .poker_li li:eq(0)').css({ left:  + 'px', transform: 'rotateZ(0deg)' });

                        }
                    });


                }

                // 出牌动效
                console.log(ready_poker.type);
                poker_effect(ready_poker.type);

                // console.log(all_play[game_status.player].poker.length);
                // console.log(all_play[game_status.player].poker);

                // 1.玩家出牌后数据初识化

                ready_poker = { poker: [], type: 0, max: 0 };

                // console.log(ready_poker.type);
                // console.log(ready_poker.max);

                // 2.重新更新桌面的牌(html操作)

                // 3.整理玩家的当前手牌
                for (var i = 0; i < all_play[game_status.player].poker.length; i++) { // 删除已出牌后 重新整理牌间距
                    // console.log($('.play_' + (game_status.player + 1)+' li').eq(i));
                    if ((game_status.player + 1) != 2) {
                        $('.play_' + (game_status.player + 1) + ' li').eq(i).css('top', i * 20 + 'px');
                    } else {
                        $('.play_' + (game_status.player + 1) + ' li').eq(i).css('left', i * 20 + 'px');
                    }

                }

                // 4.自己调用自己
                if (all_play[game_status.player].poker.length == 0) {
                    alert('你很棒棒哦~~~');

                    // 结束动画

                    // 结算积分
                }


                // 轮到下一个玩家出牌
                game_status.cancle = 0;

                // 点击事件解绑
                // $('.play_' + (game_status.player + 1)).off('click', 'li');

                if (++game_status.player > 2) {
                    game_status.player = 0;
                } else {
                    game_status.player = game_status.player;

                }

                startGame();
            }

        });

        // 不出
        $('.action').eq(game_status.player).find('img').eq(1).click(function () {
//          audio_no.play();
        	
            if (desktop_poker.type == 0) {
                // $('.play_1').off("click", "li");
                // $('.play_2').off("click", "li");
                // $('.play_3').off("click", "li");
                alert('起码你要给我整一个出来!');
            } else {
                // 每一次不出，取消次数加1
                game_status.cancle += 1;
                // 当取消的累积值到2的时候，清空桌面的牌
                if (game_status.cancle == 2) {
                    ready_poker = { poker: [], type: 0, max: 0 }
                    desktop_poker = { poker: [], type: 0, max: 0 }
                }

                // 取消出牌后当前出牌玩家的位置
                if (++game_status.player > 2) {
                    game_status.player = 0;     //  这里忽略了不出牌两次不一定刚好轮到左边第一家  也可能轮到 2 3家
                } else {
                    game_status.player = game_status.player;
                }
                console.log(game_status.cancle);

                startGame();

            }
            console.log(game_status.player);
        });
    }


    // 判断牌型的方法

    /*
        牌型代号说明
        
        0 	无效牌型
        1 	单张
        2 	对子
        3 	三张
        4 	三代一
        5 	三代二
        6   四代一
        7   四代二

        888     连对
        123     飞机
        666 	顺子
        999 	炸弹
        110 	王炸
         

    */

    //     512行调用
    function checkPokers(poker) {


        // console.log(poker+"里面");
        var length = poker.length;
        var poker_data = [];
        for (var i = 0; i < length; i++) {
            poker_data.push(poker[i].split('_'));         //  一旦牌面值超过两位数，即10以上， 则10_1 成了 10，1
        }

        console.log('检查牌函数传入的参数:' + poker_data);
        // 使用牌的数量进行判断不同的牌型可能
        switch (length) {
            // 牌的数量为1的时候的牌型判断
            case 1:
                ready_poker.type = 1; 	//设置出牌类型为单张
                ready_poker.max = poker_data[0][0]; 	//设置该牌型的判断值
                console.log(ready_poker.max);
                
                return true;
                break;
            // 牌的数量为2的时候的牌型判断
            case 2:
                if (poker_data[0][0] == poker_data[1][0]) {
                    if (poker_data[0][0] == 14) {
                    	var audio = document.createElement('audio'); 
                        audio.src ='audio/CardType_Bomb.ogg';
                        audio.play();
                        var audio1 = document.createElement('audio'); 
                        audio1.src ='audio/Audio_Guided_Missible_W.ogg';
                        audio1.play();
                        
                        // 设置出牌类型为王炸
                        ready_poker.type = 110;

                        //设置该牌型的判断值
                        ready_poker.max = 110;
                    } else {
                        // 设置出牌类型为对子
                        ready_poker.type = 2;

                        // 设置该牌型的判断值
                        ready_poker.max = poker_data[0][0];
                        console.log('牌的数量为2的poker_data[0][0]: ' + poker_data[0][0]);
                        console.log('牌的数量为2的poker_data[1][0]: ' + poker_data[1][0]);
                        console.log('牌的数量为2的ready_poker.max:  ' + ready_poker.max);
                        test();
                    }

                    return true;
                } else {

                    // 如果两个牌的点数不一样，则牌型无效
                    ready_poker.type = 0;
                    ready_poker.max = 0;
                    return false;
                }
                break;

            // 牌的数量为3的牌型判断
            case 3:
                if (poker_data[0][0] == poker_data[1][0] && poker_data[1][0] == poker_data[2][0]) {
                    // 设置出牌类型为三张
                    ready_poker.type = 3;

                    //设置该牌型的判断值
                    ready_poker.max = poker_data[0][0];
                    console.log(ready_poker.max);

                    return true;
                } else {
                    // 牌型无效
                    ready_poker.type = 0;
                    ready_poker.max = 0;
                    return false;
                }
                break;

            // 牌的数量为3的牌型判断
            case 4:
                if (poker_data[0][0] == poker_data[1][0] && poker_data[1][0] == poker_data[2][0] && poker_data[2][0] == poker_data[3][0]) {
                    var audio = document.createElement('audio'); 
                    audio.src ='audio/CardType_Bomb.ogg';
                    audio.play();
                    
                    console.log($bei);
                    $bei  = $bei * 2;  //加倍
                    console.log($bei);
                    $('.multiple span').html($bei);
                    // 设置出牌类型为普通炸弹
                    ready_poker.type = 999;

                    // 设置判断值
                    ready_poker.max = poker_data[0][0];
                    console.log(ready_poker.max);

                    return true;
                } else if ((poker_data[0][0] == poker_data[1][0] && poker_data[1][0] == poker_data[2][0]) || (poker_data[1][0] == poker_data[2][0] && poker_data[2][0] == poker_data[3][0])) {
                    //3555
                    //5552

                    // 设置出牌类型为三代一
                    ready_poker.type = 4;

                    // 设置判断值
                    console.log(poker_data[0][0]);
                    console.log(poker_data[1][0]);
                    ready_poker.max = poker_data[1][0];
                    console.log(ready_poker.max);
                    return true;
                } else {
                    // 牌型无效
                    ready_poker.type = 0;
                    ready_poker.max = 0;
                    console.log(ready_poker.type);
                    console.log(ready_poker.max);
                    return false;
                }
                break;

            case 5:
                // 判断牌型是否为顺子
                if (checkStraight(poker_data)) {
                    // 设置出牌类型为顺子
                    ready_poker.type = 666;

                    // 设置判断值
                    ready_poker.max = poker_data[length - 1][0];


                    return true;
                } else if (poker_data[0][0] == poker_data[1][0] && poker_data[2][0] == poker_data[3][0] && poker_data[3][0] == poker_data[4][0] || poker_data[0][0] == poker_data[1][0] && poker_data[1][0] == poker_data[2][0] && poker_data[3][0] == poker_data[4][0]) {
                    //16666
                    //33555
                    //55577
                    var audio = document.createElement('audio'); 
                    audio.src ='audio/Audio_Card_Three_Take_Double_W.ogg';
                    audio.play();
                    // 设置出牌类型为三代二
                    ready_poker.type = 5;

                    // 设置判断值
                    ready_poker.max = poker_data[2][0];

                    return true;
                } else {
                    // 牌型无效
                    ready_poker.type = 0;
                    ready_poker.max = 0;
                    return false;
                }
                break;

            // 牌型类型为6的判断
            case 6:
                // 判断牌型是否是顺子
                if (checkStraight(poker_data)) {
                    // 设置出牌类型为顺子
                    ready_poker.type = 666;

                    // 设置判断值
                    ready_poker.max = poker_data[length - 1][0];

                    return true;
                } else if (checkPair(poker_data)) {//判断牌型是否是连对
                    // 设置出牌类型为连对
                    ready_poker.type = 888;

                    // 设置判断值
                    ready_poker.max = poker_data[length - 1][0];
                    // console.log(ready_poker.max);

                    return true;
                } else if (ready_poker.max = checkPlane(poker_data)) {
                    //设置出牌类型为飞机
                    var audio = document.createElement('audio'); 
                    audio.src ='audio/CardType_Aircraft.ogg';
                    audio.play();
                    ready_poker.type = 123;

                    return true;
                } else if (poker_data[0][0] == poker_data[1][0] && poker_data[1][0] == poker_data[2][0] && poker_data[2][0] == poker_data[3][0] || poker_data[1][0] == poker_data[2][0] && poker_data[2][0] == poker_data[3][0] && poker_data[3][0] == poker_data[4][0]
                    || poker_data[2][0] == poker_data[3][0] && poker_data[3][0] == poker_data[4][0] && poker_data[4][0] == poker_data[5][0]) {
                    //555566
                    //555567
                    //455556
                    //445555

                    //设置类型为四带二单牌
                    ready_poker.type = 6;

                    // 设置判断值
                    ready_poker.max = poker_data[2][0];

                    return true;
                } else {
                    // 牌型无效
                    ready_poker.type = 0;
                    ready_poker.max = 0;
                    return false;
                }
                // 还有四带二哟~~~记得补上
                break;

            // 牌型类型为7的判断
            case 7:
                // 判断牌型是否是顺子
                if (checkStraight(poker_data)) {
                    // 设置出牌类型为顺子
                    ready_poker.type = 666;

                    // 设置判断值
                    ready_poker.max = poker_data[length - 1][0];

                    return true;
                } else {
                    // 牌型无效
                    ready_poker.type = 0;
                    ready_poker.max = 0;
                    return false;
                }
                break;

            // 牌型类型为8的判断
            case 8:
                // 判断牌型是否是顺子
                if (checkStraight(poker_data)) {
                    // 设置出牌类型为顺子
                    ready_poker.type = 666;

                    // 设置判断值
                    ready_poker.max = poker_data[length - 1][0];

                    return true;
                } else if (checkPair(poker_data)) {//判断牌型是否是连对
                    // 设置出牌类型为连对
                    ready_poker.type = 888;

                    // 设置判断值
                    ready_poker.max = poker_data[length - 1][0];

                    return true;
                } else if (ready_poker.max = checkPlane(poker_data)) {
                    //设置出牌类型为飞机
                    var audio = document.createElement('audio'); 
                    audio.src ='audio/CardType_Aircraft.ogg';
                    audio.play();
                    ready_poker.type = 123;

                    return true;
                } else {
                    // 牌型无效
                    ready_poker.type = 0;
                    ready_poker.max = 0;
                    return false;
                }
                break;

            // 牌型类型为9的判断
            case 9:
                // 判断牌型是否是顺子
                if (checkStraight(poker_data)) {
                    // 设置出牌类型为顺子
                    ready_poker.type = 666;

                    // 设置判断值
                    ready_poker.max = poker_data[length - 1][0];

                    return true;
                } else if (ready_poker.max = checkPlane(poker_data)) {
                    //设置出牌类型为飞机
                    ready_poker.type = 123;

                    return true;
                } else {
                    // 牌型无效
                    ready_poker.type = 0;
                    ready_poker.max = 0;
                    return false;
                }
                break;

            // 牌型类型为10的判断
            case 10:
                if (checkStraight(poker_data)) {
                    // 设置出牌类型为顺子
                    ready_poker.type = 666;

                    // 设置判断值
                    ready_poker.max = poker_data[length - 1][0];

                    return true;
                } else if (checkPair(poker_data)) {//判断牌型是否是连对
                    // 设置出牌类型为连对
                    ready_poker.type = 888;

                    // 设置判断值
                    ready_poker.max = poker_data[length - 1][0];

                    return true;
                } else if (ready_poker.max = checkPlane(poker_data)) {
                    //设置出牌类型为飞机
                    ready_poker.type = 123;

                    return true;
                } else {
                    // 牌型无效
                    ready_poker.type = 0;
                    ready_poker.max = 0;
                    return false;
                }
                break;

            // 牌型类型为11的判断
            case 11:
                // 判断牌型是否是顺子
                if (checkStraight(poker_data)) {
                    // 设置出牌类型为顺子
                    ready_poker.type = 666;

                    // 设置判断值
                    ready_poker.max = poker_data[length - 1][0];

                    return true;
                } else {
                    // 牌型无效
                    ready_poker.type = 0;
                    ready_poker.max = 0;
                    return false;
                }
                break;

            // 牌型类型为12的判断
            case 12:
                if (checkStraight(poker_data)) {
                    // 设置出牌类型为顺子
                    ready_poker.type = 666;

                    // 设置判断值
                    ready_poker.max = poker_data[length - 1][0];

                    return true;
                } else if (checkPair(poker_data)) {//判断牌型是否是连对
                    // 设置出牌类型为连对
                    ready_poker.type = 888;

                    // 设置判断值
                    ready_poker.max = poker_data[length - 1][0];

                    return true;
                } else if (ready_poker.max = checkPlane(poker_data)) {
                    //设置出牌类型为飞机
                    ready_poker.type = 123;

                    return true;
                } else {
                    // 牌型无效
                    ready_poker.type = 0;
                    ready_poker.max = 0;
                    return false;
                }
                break;

            // 牌型类型为13的判断
            case 13:
                if (checkStraight(poker_data)) {
                    // 设置出牌类型为顺子
                    ready_poker.type = 666;

                    // 设置判断值
                    ready_poker.max = poker_data[length - 1][0];

                    return true;
                } else {
                    // 牌型无效
                    ready_poker.type = 0;
                    ready_poker.max = 0;
                    return false;
                }
                break;

            // 牌型类型为14的判断
            case 14:
                if (checkPair(poker_data)) {//判断牌型是否是连对
                    // 设置出牌类型为连对
                    ready_poker.type = 888;

                    // 设置判断值
                    ready_poker.max = poker_data[length - 1][0];

                    return true;
                } else {
                    // 牌型无效
                    ready_poker.type = 0;
                    ready_poker.max = 0;
                    return false;
                }
                break;

            // 牌型类型为15的判断
            case 15:
                // 牌型无效
                ready_poker.type = 0;
                ready_poker.max = 0;
                return false;
                break;

            // 牌型类型为16的判断
            case 16:
                if (checkPair(poker_data)) {//判断牌型是否是连对
                    // 设置出牌类型为连对
                    ready_poker.type = 888;

                    // 设置判断值
                    ready_poker.max = poker_data[length - 1][0];

                    return true;
                } else if (ready_poker.max = checkPlane(poker_data)) {
                    //设置出牌类型为飞机
                    ready_poker.type = 123;

                    return true;
                } else {
                    // 牌型无效
                    ready_poker.type = 0;
                    ready_poker.max = 0;
                    return false;
                }
                break;

            // 牌型类型为17的判断
            case 17:
                // 牌型无效
                ready_poker.type = 0;
                ready_poker.max = 0;
                return false;
                break;

            // 牌型类型为18的判断
            case 18:
                if (checkPair(poker_data)) {//判断牌型是否是连对
                    // 设置出牌类型为连对
                    ready_poker.type = 888;

                    // 设置判断值
                    ready_poker.max = poker_data[length - 1][0];

                    return true;
                } else if (ready_poker.max = checkPlane(poker_data)) {
                    //设置出牌类型为飞机
                    ready_poker.type = 123;

                    return true;
                } else {
                    // 牌型无效
                    ready_poker.type = 0;
                    ready_poker.max = 0;
                    return false;
                }
                break;

            // 牌型类型为19的判断
            case 19:
                // 牌型无效
                ready_poker.type = 0;
                ready_poker.max = 0;
                return false;
                break;

            // 牌型类型为20的判断
            case 20:
                if (checkPair(poker_data)) {//判断牌型是否是连对
                    // 设置出牌类型为连对
                    ready_poker.type = 888;

                    // 设置判断值
                    ready_poker.max = poker_data[length - 1][0];

                    return true;
                } else if (ready_poker.max = checkPlane(poker_data)) {
                    //设置出牌类型为飞机
                    ready_poker.type = 123;

                    return true;
                } else {
                    // 牌型无效
                    ready_poker.type = 0;
                    ready_poker.max = 0;
                    return false;
                }
                break;
        }
    }

    // 检测牌型是否为顺子的方法
    function checkStraight(arr) {
        for (var i = 0; i < arr.length - 1; i++) {
            //34567
            console.log(arr);
            // 3+1 !=  5
            if (arr[i][0] != parseInt(arr[i + 1][0]) + 1) {
                console.log(parseInt(arr[i][0]));
                console.log(arr[i][0]);
                console.log(arr[i + 1][0]);
                console.log(parseInt(arr[i + 1][0]) + 1);
                return false;
            }
        }

        return true;
    }


    // 检测牌型是否是连对的方法
    function checkPair(poker) {
        //334455
        // 长度不能大于20
        //最大值不能为13
        for (var i = 0; i < poker.length - 3; i += 2) {
            // 第一个值 不等于 第二个值 或者 下一个的值不等于当前值加1
            // console.log(i);
            if (poker[i][0] != poker[i + 1][0] || poker[i + 1][0] != parseInt(poker[i + 2][0]) + 1) {

                console.log(poker);
                console.log(i);
                // console.log(poker[i-1][0]);
                console.log(poker[i][0]);
                console.log(poker[i + 1][0]);
                console.log(poker[i + 2][0]);
                console.log(poker[i + 3][0]);
                console.log(poker[i + 4][0]);
                console.log(parseInt(poker[i + 3][0]) + 1);
                // console.log(parseInt(poker[i + 2][0]) + 1);
                return false;
            }

        }

        return true;
    }


    // 牌型对决的方法
    function pokerVs() {
        // 桌面上没有牌，任何牌型都可以出
        if (desktop_poker.type == 0) {
            // 判断是否符合规则
            return true;
        } else if (ready_poker.type == 110) {//王炸可以直接出
            return true;
        } else if (desktop_poker.type != 999 && desktop_poker.type != 110 && ready_poker.type == 999) {
            // 桌面上牌不是炸弹和王炸，那玩家的牌只要是炸弹就可以出牌
            return true;
        } else if (desktop_poker.type == ready_poker.type && desktop_poker.poker.length == ready_poker.poker.length && ready_poker.max > desktop_poker.max) {
            console.log(desktop_poker.max);
            // console.log(ready_poker.max);
            // console.log(desktop_poker.poker.length);
            // console.log(ready_poker.poker.length);
            // 普通牌型大小的判断
            return true;
        } else {
            console.log('末尾的ready_poker.max:     ' + ready_poker.max);            //  确定出的牌 选中并点击'出牌'的牌的最大值
            console.log('末尾的desktop_poker.max:   ' + desktop_poker.max);          //  上一家已出牌的最大值
            console.log('末尾的ready_poker.type:    ' + ready_poker.type);           //  确定出的牌 选中并点击'出牌'的牌的类型
            console.log('末尾的desktop_poker.type:  ' + desktop_poker.type);         //  上一家已出牌的类型
            console.log('末尾的ready_poker.poker.length: ' + ready_poker.poker.length);   //  确定出的牌  选中并点击'出牌'的牌的长度
            console.log('末尾的desktop_poker.poker.length: ' + desktop_poker.poker.length); //  上一家已出牌的长度

            return false;
        }
    }

    // 检测牌型是否为飞机的方法
    // 由于飞机的判断值很难从外部获取，所以此函数会返回判断值
    function checkPlane(poker) {
        var max = false;
        console.log(poker);
        // 判断是不是纯三张相连
        //333444
        for (var i = 0; i < poker.length - 4; i += 3) {
            if (poker[i][0] != poker[i + 2][0] || poker[i][0] != parseInt(poker[i + 3][0]) + 1) {
                console.log(poker[i][0]);
                console.log(poker[i][0] + 1);
                console.log(poker[i + 3][0]);
                // return false;
                break;  //跳出当前循环
            } else {
                // 我们还需要判断更多的牌的张数的情况 ******
                max = poker[i + 3][0];            //这里的max到底是返回最大值还是  true false
                console.log(max);
            }
        }

        // 判断是否为三带一相连
        if (!max) {
            console.log(max);
            switch (poker.length) {
                case 8:
                    //33344456
                    //56777888
                    //56667778
                    //33334445

                    if (poker[0][0] == poker[2][0] && poker[2][0] == parseInt(poker[3][0]) + 1 && poker[3][0] == poker[5][0]) {
                        // console.log(poker[0][0]);
                        // console.log(poker[2][0]);
                        // console.log(poker[3][0]);
                        max = poker[5][0];
                        console.log(max);
                    } else if (poker[2][0] == poker[4][0] && poker[4][0] == parseInt(poker[5][0]) + 1 && poker[5][0] == poker[7][0]) {
                        max = poker[7][0];
                        console.log(max);
                    } else if (poker[1][0] == poker[3][0] && poker[3][0] == parseInt(poker[4][0]) + 1 && poker[4][0] == poker[6][0]) {
                        max = poker[6][0];
                        console.log(max);
                    }
                    break;

                case 10:
                    //3334447788
                    //3355888999
                    //3355566688
                    if (poker[0][0] == poker[2][0] && poker[2][0] == parseInt(poker[3][0]) + 1 && poker[3][0] == poker[5][0] && poker[6][0] == poker[7][0] && poker[8][0] == poker[9][0] && poker[7][0] != poker[8][0]) {
                        max = poker[5][0];
                    } else if (poker[4][0] == poker[6][0] && poker[6][0] == parseInt(poker[7][0]) + 1 && poker[7][0] == poker[9][0] && poker[0][0] == poker[1][0] && poker[2][0] == poker[3][0] && poker[1][0] != poker[2][0]) {
                        max = poker[8][0];
                    } else if (poker[2][0] == poker[4][0] && poker[4][0] == parseInt(poker[5][0]) + 1 && poker[5][0] == poker[7][0] && poker[0][0] == poker[1][0] && poker[8][0] == poker[9][0] && poker[1][0] != poker[8][0]) {
                        max = poker[8][0];
                        console.log(max);
                    }
                    break;

                case 12:
                    //333444555678
                    //344455566678
                    //345556667778
                    //345444555666
                    if (poker[0][0] == poker[2][0] && poker[2][0] == parseInt(poker[3][0]) + 1 && poker[3][0] == poker[5][0] && poker[3][0] == parseInt(poker[4][0]) + 1 && poker[4][0] == poker[6][0]) {
                        max = poker[8][0];
                    } else if (poker[1][0] == poker[3][0] && poker[3][0] == parseInt(poker[4][0]) + 1 && poker[4][0] == poker[6][0] && poker[6][0] == parseInt(poker[7][0]) + 1 && poker[7][0] == poker[9][0]) {
                        max = poker[9][0];
                    } else if (poker[2][0] == poker[4][0] && poker[4][0] == parseInt(poker[5][0]) + 1 && poker[5][0] == poker[7][0] && poker[7][0] == parseInt(poker[8][0]) + 1 && poker[8][0] == poker[10][0]) {
                        max = poker[9][0];
                    } else if (poker[3][0] == poker[5][0] && poker[5][0] == parseInt(poker[6][0]) + 1 && poker[6][0] == poker[8][0] && poker[8][0] == parseInt(poker[9][0]) + 1 && poker[9][0] == poker[11][0]) {
                        max = poker[9][0];
                        console.log(max);
                    }
                    break;

                case 15:
                    //333444555778899
                    //335556667778899
                    //334455566677799
                    //334455777888999
                    if (poker[0][0] == poker[2][0] && poker[2][0] == parseInt(poker[3][0]) + 1 && poker[3][0] == poker[5][0] && poker[5][0] == parseInt(poker[6][0]) + 1 &&
                        poker[0][0] == poker[1][0] && poker[1][0] != poker[2][0] && poker[2][0] == poker[3][0] && poker[2][0] != poker[3][0] && poker[4][0] == poker[5][0] && poker[3][0] != poker[4][0]) {
                        max = poker[8][0];
                    } else if (poker[2][0] == poker[4][0] && poker[4][0] == parseInt(poker[5][0]) + 1 && poker[5][0] == poker[7][0] && poker[7][0] == parseInt(poker[8][0]) + 1 &&
                        poker[2][0] == poker[3][0] && poker[3][0] != poker[4][0] && poker[4][0] == poker[5][0] && poker[4][0] != poker[5][0] && poker[6][0] == poker[7][0] && poker[5][0] != poker[6][0]) {
                        max = poker[9][0];
                    } else if (poker[4][0] == poker[6][0] && poker[6][0] == parseInt(poker[7][0]) + 1 && poker[7][0] == poker[9][0] && poker[9][0] == parseInt(poker[10][0]) + 1 &&
                        poker[4][0] == poker[5][0] && poker[5][0] != poker[6][0] && poker[6][0] == poker[7][0] && poker[6][0] != poker[7][0] && poker[8][0] == poker[9][0] && poker[7][0] != poker[8][0]) {
                        max = poker[11][0];
                    } else if (poker[6][0] == poker[8][0] && poker[8][0] == parseInt(poker[9][0]) + 1 && poker[9][0] == poker[11][0] && poker[11][0] == parseInt(poker[12][0]) + 1 &&
                        poker[6][0] == poker[7][0] && poker[7][0] != poker[8][0] && poker[8][0] == poker[9][0] && poker[8][0] != poker[9][0] && poker[10][0] == poker[11][0] && poker[9][0] != poker[10][0]) {
                        max = poker[13][0];
                    }
                    break;

                case 16:
                    //333444555666789J
                    //J333444555666789
                    //JQ33344455566678
                    //JQK3334445556667
                    //JQKA333444555666
                    if (poker[0][0] == poker[2][0] && poker[3][0] == poker[5][0] && poker[6][0] == poker[8][0] && poker[9][0] == poker[11][0] &&
                        poker[2][0] == parseInt(poker[3][0]) + 1 && poker[5][0] == parseInt(poker[6][0]) + 1 && poker[8][0] == parseInt(poker[9][0]) + 1) {
                        max = poker[10][0];
                    } else if (poker[1][0] == poker[3][0] && poker[4][0] == poker[6][0] && poker[7][0] == poker[9][0] && poker[10][0] == poker[12][0] &&
                        poker[3][0] == parseInt(poker[4][0]) + 1 && poker[6][0] == parseInt(poker[7][0]) + 1 && poker[9][0] == parseInt(poker[10][0]) + 1) {
                        max = poker[11][0];
                    } else if (poker[2][0] == poker[4][0] && poker[5][0] == poker[7][0] && poker[8][0] == poker[10][0] && poker[11][0] == poker[13][0] &&
                        poker[4][0] == parseInt(poker[5][0]) + 1 && poker[7][0] == parseInt(poker[8][0]) + 1 && poker[10][0] == parseInt(poker[11][0]) + 1) {
                        max = poker[12][0];
                    } else if (poker[3][0] == poker[5][0] && poker[6][0] == poker[8][0] && poker[9][0] == poker[11][0] && poker[12][0] == poker[14][0] &&
                        poker[5][0] == parseInt(poker[6][0]) + 1 && poker[8][0] == parseInt(poker[9][0]) + 1 && poker[11][0] == parseInt(poker[12][0]) + 1) {
                        max = poker[13][0];
                    } else if (poker[4][0] == poker[6][0] && poker[7][0] == poker[9][0] && poker[10][0] == poker[12][0] && poker[13][0] == poker[15][0] &&
                        poker[6][0] == parseInt(poker[7][0]) + 1 && poker[9][0] == parseInt(poker[10][0]) + 1 && poker[12][0] == parseInt(poker[13][0]) + 1) {
                        max = poker[14][0];
                    }
                    break;

                case 20:
                    //  5代5单牌
                    //3334445556667779JQKA
                    //A3334445556667779JQK
                    //AK3334445556667779JQ
                    //AKQ3334445556667779J
                    //AKQJ3334445556667779
                    //AKQJ9333444555666777
                    //  4代对 
                    //33344455566699JJQQKK
                    //JJ33344455566699QQKK
                    //JJQQ33344455566699KK
                    //JJQQKK33344455566699
                    //JJQQKK99333444555666
                    if (poker[0][0] == poker[2][0] && poker[3][0] == poker[5][0] && poker[6][0] == poker[8][0] && poker[9][0] == poker[11][0] && poker[12][0] == poker[14][0] &&
                        poker[2][0] == parseInt(poker[3][0]) + 1 && poker[5][0] == parseInt(poker[6][0]) + 1 && poker[8][0] == parseInt(poker[9][0]) + 1 && poker[11][0] == parseInt(poker[12][0]) + 1) {
                        max = poker[13][0];
                    } else if (poker[1][0] == poker[3][0] && poker[4][0] == poker[6][0] && poker[7][0] == poker[9][0] && poker[10][0] == poker[12][0] && poker[13][0] == poker[15][0] &&
                        poker[3][0] == parseInt(poker[4][0]) + 1 && poker[6][0] == parseInt(poker[7][0]) + 1 && poker[9][0] == parseInt(poker[10][0]) + 1 && poker[12][0] == parseInt(poker[13][0]) + 1) {
                        max = poker[14][0];
                    } else if (poker[2][0] == poker[4][0] && poker[5][0] == poker[7][0] && poker[8][0] == poker[10][0] && poker[11][0] == poker[13][0] && poker[14][0] == poker[16][0] &&
                        poker[4][0] == parseInt(poker[5][0]) + 1 && poker[7][0] == parseInt(poker[8][0]) + 1 && poker[10][0] == parseInt(poker[11][0]) + 1 && poker[13][0] == parseInt(poker[14][0]) + 1) {
                        max = poker[15][0];
                    } else if (poker[3][0] == poker[5][0] && poker[6][0] == poker[8][0] && poker[9][0] == poker[11][0] && poker[12][0] == poker[14][0] && poker[15][0] == poker[17][0] &&
                        poker[5][0] == parseInt(poker[6][0]) + 1 && poker[8][0] == parseInt(poker[9][0]) + 1 && poker[11][0] == parseInt(poker[12][0]) + 1 && poker[14][0] == parseInt(poker[15][0]) + 1) {
                        max = poker[16][0];
                    } else if (poker[4][0] == poker[6][0] && poker[7][0] == poker[9][0] && poker[10][0] == poker[12][0] && poker[13][0] == poker[15][0] && poker[16][0] == poker[18][0] &&
                        poker[6][0] == parseInt(poker[7][0]) + 1 && poker[9][0] == parseInt(poker[10][0]) + 1 && poker[12][0] == parseInt(poker[13][0]) + 1 && poker[15][0] == parseInt(poker[16][0]) + 1) {
                        max = poker[17][0];
                    } else if (poker[5][0] == poker[7][0] && poker[8][0] == poker[10][0] && poker[11][0] == poker[13][0] && poker[14][0] == poker[16][0] && poker[17][0] == poker[19][0] &&
                        poker[7][0] == parseInt(poker[8][0]) + 1 && poker[10][0] == parseInt(poker[11][0]) + 1 && poker[13][0] == parseInt(poker[14][0]) + 1 && poker[16][0] == parseInt(poker[17][0]) + 1) {
                        max = poker[18][0];
                    }
                    //    4代对
                    else if (poker[0][0] == poker[2][0] && poker[3][0] == poker[5][0] && poker[6][0] == poker[8][0] && poker[9][0] == poker[11][0] &&
                        poker[2][0] == parseInt(poker[3][0]) + 1 && poker[5][0] == parseInt(poker[6][0]) + 1 && poker[8][0] == parseInt(poker[9][0]) + 1 &&
                        poker[12][0] == poker[13][0] && poker[14][0] == poker[15][0] && poker[16][0] == poker[17][0] && poker[18][0] == poker[19][0]) {
                        max = poker[10][0];
                    } else if (poker[2][0] == poker[4][0] && poker[5][0] == poker[7][0] && poker[8][0] == poker[10][0] && poker[11][0] == poker[13][0] &&
                        poker[4][0] == parseInt(poker[5][0]) + 1 && poker[7][0] == parseInt(poker[8][0]) + 1 && poker[10][0] == parseInt(poker[11][0]) + 1 &&
                        poker[0][0] == poker[1][0] && poker[14][0] == poker[15][0] && poker[16][0] == poker[17][0] && poker[18][0] == poker[19][0]) {
                        max = poker[12][0];
                    } else if (poker[4][0] == poker[6][0] && poker[7][0] == poker[9][0] && poker[10][0] == poker[12][0] && poker[13][0] == poker[15][0] &&
                        poker[4][0] == parseInt(poker[7][0]) + 1 && poker[9][0] == parseInt(poker[10][0]) + 1 && poker[12][0] == parseInt(poker[13][0]) + 1 &&
                        poker[0][0] == poker[1][0] && poker[2][0] == poker[3][0] && poker[16][0] == poker[17][0] && poker[18][0] == poker[19][0]) {
                        max = poker[14][0];
                    } else if (poker[6][0] == poker[8][0] && poker[9][0] == poker[11][0] && poker[12][0] == poker[14][0] && poker[15][0] == poker[17][0] &&
                        poker[4][0] == parseInt(poker[9][0]) + 1 && poker[11][0] == parseInt(poker[12][0]) + 1 && poker[14][0] == parseInt(poker[15][0]) + 1 &&
                        poker[0][0] == poker[1][0] && poker[2][0] == poker[3][0] && poker[4][0] == poker[5][0] && poker[18][0] == poker[19][0]) {
                        max = poker[16][0];
                    } else if (poker[8][0] == poker[10][0] && poker[11][0] == poker[13][0] && poker[14][0] == poker[16][0] && poker[17][0] == poker[19][0] &&
                        poker[4][0] == parseInt(poker[11][0]) + 1 && poker[11][0] == parseInt(poker[14][0]) + 1 && poker[16][0] == parseInt(poker[17][0]) + 1 &&
                        poker[0][0] == poker[1][0] && poker[2][0] == poker[3][0] && poker[4][0] == poker[5][0] && poker[6][0] == poker[7][0]) {
                        max = poker[18][0];
                    }
                    break;
            }
        }


        return max;
    }
    //  管家点击  傻强的事件
    $('.butler').click(function () {
        $('.shaqiang').css({ 'transform': 'scale(1)' });
        $('.chatting').css('right', '540px');
        $('.butler').css({'right': '530px','transform':'scale(0)'});
        $('.tuixia').css({'right': '530px','transform':'scale(1)'});

    });
    $('.tuixia').click(function(){
        $('.shaqiang').css({ 'transform': 'scale(0)' });
        $('.chatting').css('right', '150px');
        $('.butler').css({'right': '140px','transform':'scale(1)'});
        $('.tuixia').css({'right': '140px','transform':'scale(0)'});

    });
    // 火箭 顺子  连队  等各种出牌动效函数  传入的thar值为 ready_poker.type 值 即牌型类型
    function poker_effect(thar) {
        var huo;
        if (thar == 110) {
            huo = '.huojian';
            $('.huojian').css({'display':'block'});
            execute(huo);
        } else if (thar == 999) {
            huo = '.zhadan';
            $('.zhadan').css({'display':'block'});
            execute(huo);
        } else if (thar == 888) {
            huo = '.liandui';
            $('.liandui').css({'display':'block'});
            execute(huo);
        } else if (thar == 666) {
            huo = '.shunzi';
            $('.shunzi').css({'display':'block'});
            execute(huo);
        } else if (thar == 123) {
            huo = '.feiji';
            $('.feiji').css({'display':'block'});
            execute(huo);
        }

    }
    // 执行动效函数 传入的thar 为huo变量的值 , 即牌型
    function execute(thar) {
        var i = 0;
        var $timmer = setInterval(function () {
            i = i + 1;
            for (let j = 0; j < 10; j++) {
                if (j != i) {
                    $(thar+' img').eq(j).css('display', 'none');
                } else {
                    $(thar+' img').eq(i).css('display', 'inline-block');
                }
            }

        }, 80);
        setTimeout(function () {
            clearInterval($timmer);
        }, 1000);

    }
    // 聊天框的点击事件
    var frequency = 0;   // 点击次数
    $('.liao_icon').click(function(){
        ++frequency;
        if(frequency==1){
            $('.liaotian').css({'transform': 'scale(1)'});
        }else{
            frequency=0;
            $('.liaotian').css({'transform': 'scale(0)'});
        }
    });
    // 鸭梨的鼠标移入事件
    // $('.pear').mouseover(function(){
    //     var pear = document.getElementsByClassName('pear_img');
    //     var i = 0;
    //     var $timmer = setInterval(function () {
    //         i = i + 1;
    //         for (let j = 0; j < 4; j++) {
    //             if (j != i) {
    //                 $('.pear_img').eq(j).css('display', 'none');
    //             } else {
    //                 $('.pear_img').eq(i).css('display', 'block');
    //             }
    //         }

    //     }, 150);
    //     setTimeout(function () {
    //         clearInterval($timmer);
    //     }, 600);

    // });  

    // 聊天框语句的点击事件    反馈的行为、执行的行为
    $('.liaotian .sp').on('click', 'img', function () {
        var a =$(this).attr('data-value');
        for(var i=0;i<$('.getBoss').length;i++){
            console.log(i);
            if($('.getBoss').eq(i).attr('data-boss')==1){

                $('.say' +(i+1)).css({'z-index':'110'});
                $('.say' +(i+1)+' img').eq(a-1).css({'transform':'scale(1)','filter':'brightness(1)'}); 
                var $a = $('.say' +(i+1)+' img').eq(a-1);
                // console.log($a);
                dingshi($a);

            }

        }
        
        // console.log($(this).attr('data-value'));
    
    });

    // thar 接受的是点击的那一条聊天框
    function dingshi(thar){    
        setTimeout(function(){
            thar.css({'transform':'scale(0)'}) 
        },3000);

        console.log(thar);
    }    
    
    // 倍数详情的点击事件
    var bei = true;
    $('.multiple img').eq(0).click(function(){
        if(bei){
            $('.double').css({'transform':'scale(1)'});
            bei = false;
        }else{
            $('.double').css({'transform':'scale(0)'});
            bei = true;
        }
    });
    $('.coffee').click(function(){
    	var i = 0;
        var $timmer = setInterval(function () {
            i = i + 1;
            for (let j = 0; j < 15; j++) {
                if (j != i) {
                    $('.cofe img').eq(j).css('display', 'none');
                } else {
                    $('.cofe img').eq(i).css('display', 'inline-block');
                }
            }

        }, 150);
        setTimeout(function () {
            clearInterval($timmer);
        }, 2250);
    })

});