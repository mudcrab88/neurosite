window.onload= function () {
	var canv = document.getElementById("canvas");
	var ctx = canv.getContext("2d");
	var canv_new = document.getElementById("canvas_new");
	var result = document.getElementById("result");
	var ctx_new = canv_new.getContext("2d");
	var Pencil = {};
    canv.width = 280;
    canv.height = 280;
	canv_new.width = 28;
	canv_new.height = 28;
	ctx.lineWidth = 20;
	ctx.strokeStyle = '#000000';
	ctx.fillStyle = '#FAAAAA';
	ctx_new.strokeStyle = '#00A0B0';
	ctx_new.fillStyle = '#000000';
    tool = Pencil;
	drawing = false;
	startBtn=document.getElementById("startbtn");
	selectLetter=document.getElementById("select_letter");
    startBtn.addEventListener("mousedown",resize);
    clearBtn=document.getElementById("clearbtn");
    clearBtn.addEventListener("mousedown",clear_draw);
	// начало рисования
	function start_draw(e){
	    var evnt = ie_event(e);
		tool.start(evnt);
		//alert(e.changedTouches[0].clientX+" "+e.clientX);
	}
	function stop_draw(e){
	    if (drawing) {
            var evnt = ie_event(e);
            tool.finish(evnt);
        }
	}
	function draw(e){
        if (drawing) {
            var evnt = ie_event(e);
            tool.move(evnt);
        }
	}
    canv.addEventListener("touchstart", start_draw);
    canv.addEventListener("touchend", stop_draw);
    canv.addEventListener("touchmove", draw);
    canv.onmousedown = function(e) {
        var evnt = ie_event(e);
		tool.start(evnt);
    };

    // Кнопка мыши отпущена, рисование прекращаем
    canv.onmouseup = function(e){
        if (drawing) {
    var evnt = ie_event(e);
            tool.finish(evnt);
        }
    };
    // процесс рисования
    canv.onmousemove = function(e){
    if (drawing) {
            var evnt = ie_event(e);
            tool.move(evnt);
        }
    };
	function ie_event(e) {
		if (e === undefined)
			{ return window.event; };
		return e;
	}
	function resize() {
	    result.innerHTML = "";
		small_img = [];
		small_img_str = "";
		for (var i = 0; i < canv.width; i+=10) {
		   for (var j = 0; j < canv.height; j+=10) {
			   //console.log(i, j);
			   pixeldata = ctx.getImageData(j,i,10,10).data;
			   array_sum = 0;//сумма элементов pixeldata
			   for(var k = 0; k < pixeldata.length; k++){
					array_sum += pixeldata[k];
				}
				if (array_sum>0) {
					ctx_new.fillRect(j/10, i/10, 1, 1);
				}
				small_img[small_img.length] = parseInt(array_sum/100);
				small_img_str += parseInt(array_sum/100) + ",";

			   //ctx.fillRect(i, j, 9, 9);
		   }
		}
		//console.log(small_img_str);
		var csrftoken = getCookie('csrftoken');
		//режим работы
		var mode=document.getElementsByName("mode");
        if(mode[0].checked) {
            url_send = "/learning/read/";
        }
        else if(mode[1].checked) {
            small_img_str += selectLetter.value;
            url_send = "/learning/write/";
        };
        console.log(url_send);
		$.ajax({
            type: "POST",
            beforeSend: function(request) {
                return request.setRequestHeader('X-CSRF-Token', csrftoken);
            },
            url: url_send,
            data: small_img_str,
            success: function(msg){
                result.innerHTML = msg;
            }
        });
	}

	function clear_draw() {
        ctx.clearRect(0, 0, canv.width, canv.height);
        ctx_new.clearRect(0, 0, canv_new.width, canv_new.height);
        result.innerHTML = "";
        console.clear();
	}

	function getCookie(name) {
        var cookieValue = null;
        if (document.cookie && document.cookie != '') {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = jQuery.trim(cookies[i]);
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) == (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    Pencil.start = function(evnt)	{
        // Текущее положение мыши - начальные координаты
        Pencil.x = evnt.clientX;
        if (Pencil.x==undefined) {
            Pencil.x =evnt.changedTouches[0].clientX;
        }
        Pencil.y= evnt.clientY;
        if (Pencil.y==undefined) {
            Pencil.y =evnt.changedTouches[0].clientY;
        }
        ctx.beginPath();
        // Свойства рисования
        //ctx.strokeStyle = Canva.selectedColor;
        //ctx.lineWidth = Canva.selectedWidth;
        ctx.moveTo(Pencil.x, Pencil.y); // Курсор на начальную позицию
        drawing = true; // Начато рисование
    };
	  
	// Рисование закончили
    Pencil.finish = function(evnt){
        Pencil.x = evnt.clientX;
        if (Pencil.x==undefined) {
            Pencil.x =evnt.changedTouches[0].clientX;
        }
        Pencil.y= evnt.clientY;
        if (Pencil.y==undefined) {
            Pencil.y =evnt.changedTouches[0].clientY;
        }
        ctx.lineTo(Pencil.x, Pencil.y); // Дорисовываем последнюю линию
        drawing = false;
    };
	  
	// Рисование в разгаре
    Pencil.move = function(evnt){
        Pencil.x = evnt.clientX;
        if (Pencil.x==undefined) {
            Pencil.x =evnt.changedTouches[0].clientX;
        }
        Pencil.y= evnt.clientY;
        if (Pencil.y==undefined) {
            Pencil.y =evnt.changedTouches[0].clientY;
        }
        ctx.lineTo(Pencil.x, Pencil.y); // Дорисовываем начатую линию
        ctx.stroke();
        // Начинаем рисованть новую линию из той же точки.
        ctx.moveTo(Pencil.x, Pencil.y);
    };
}