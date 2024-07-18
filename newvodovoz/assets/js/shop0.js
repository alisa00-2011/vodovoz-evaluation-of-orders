var shopModules = (function(window, undefined) {

    'use strict';

    var $body = $('body'),

        cards = '.b-good, .b-product, .b-mp-water_product, .b-mp-rent_card';

    function quickAmount() {

        $body.on('click.setQuickAmount', '[data-quick-amount]', function(e) {

            e.preventDefault();

            var $this = $(this),

                amount = $this.data('quickAmount') ||  parseInt($this.text(), 10),
                qaSelector = '[data-quick-amount-id="' + $this.data('quickAmountId') + '"]';

            amount = amount.isInteger() ? amount : 1;

            $('button' + qaSelector).removeClass('active');
            $this.addClass('active');

            $('.js-spinner' + qaSelector).val(amount).trigger('change');

        });

        $body.on('change.unsetQuickAmount', '.js-spinner', function(e) {

            e.preventDefault();

            var $this = $(this),

                amount = parseInt($this.val(), 10),
                qaSelector = 'button[data-quick-amount-id="' + $this.data('quickAmountId') + '"]';

            $(qaSelector).removeClass('active');
            $(qaSelector + '[data-quick-amount="' + amount + '"]').addClass('active');

            calcItemPrice.call($this.closest(cards), amount);

        });

    }

    function priceRanges() {

        $body.on('change.priceRangesChange', '.js-price-range-change', function(e) {

            e.preventDefault();

            var $this = $(this),
                $card = $this.closest(cards),

                priceArray = $this.find('option:selected').data('prices'),
                actualPriceArray = $this.find('option:selected').data('actualPrices');

            if (priceArray) {

                $card.find('[data-price-array]').data('priceArray', priceArray);

            }

            if (actualPriceArray) {

                $card.find('[data-actual-price-array]').data('actualPriceArray', actualPriceArray);

            }

            $card.find('.js-spinner').trigger('change');

        });

    }

    function calcItemPrice(amount) {

        amount = !!amount ? amount : 1;

        var priceArray = this.find('[data-price-array]').data('priceArray'),
            price = 0,

            actualPriceArray = this.find('[data-actual-price-array]').data('actualPriceArray'),
            actualPrice = 0,

            index = 0,

            $addToCart = this.find('.js-add-to-cart');

        if (actualPriceArray) {

            $.each(actualPriceArray, function(i) {

                if ( amount >= this.range[0] && (this.range.length > 1 ? amount <= this.range[1] : actualPriceArray.length === i + 1 ? true : amount <= this.range[0]) ) {

                    index = i;
                    actualPrice = this.price;

                }

            });

            var $pricesTable = this.find('.b-mp-water_product_prices_table');

            $pricesTable.find('tr').removeClass('current');
            $pricesTable.find('tr').eq(index - 1).addClass('current');

            this.find('[data-actual-sum]').data('actualSum', actualPrice * amount).text(actualPrice * amount);
            this.find('[data-actual-price]').data('actualPrice', actualPrice).text(actualPrice);

            $addToCart.data('price', actualPrice);

        }

        if (priceArray) {

            $.each(priceArray, function(i) {

                if ( amount >= this.range[0] && (this.range.length > 1 ? amount <= this.range[1] : priceArray.length === i + 1 ? true : amount <= this.range[0]) ) {

                    price = this.price;

                }

            });

            this.find('[data-sum]').data('sum', actualPrice * amount).text(actualPrice * amount);
            this.find('[data-price]').data('price', actualPrice).text(actualPrice);

        }

    }

    function addToCart() {

        $body.on('click.addToCart', '.js-add-to-cart', function(e) {

            e.preventDefault();

            var $this = $(this);

            if (!$this.data('multiAddingAllowed') && $this.hasClass('inCart') && !!$this.data('redirectAllowed')) {

                window.location = $this.attr('href');

            }

            if (!$this.data('multiAddingAllowed') ? !$this.hasClass('inCart') : true) {

                var formData = $this.closest('.b-good, form').find('input, select, textarea').serializeObject(),
                    data = $.extend({}, $this.data(), formData);

                _request($(this).attr('href') || $(this).closest('form').attr('action') || $(this).data('url') || window.location, $(this).data('method') || 'post', data, $this);

            }

        });

        function _request(url, method, data, $this) {
						console.log( url + '.json');
            $.ajax({
                url: url + '.json',
                method: method,
                dataType: 'json',
                data: data,
                success: function(response) {

                    if (!!response.status) {

                        var $carousel = $this.closest('.b-carousel');

                        if (!!response.btnClass) {

                            $this
                                .data('originalLabel', $this.text())
                                .toggleClass(response.btnClass, true)
                                .text(response.btnLabel || 'В корзине');

                            $carousel
                                .find('.js-add-to-cart[data-id="' + $this.data('id') + '"]').not('.inCart')
                                .data('originalLabel', $this.text())
                                .toggleClass(response.btnClass, true)
                                .text(response.btnLabel || 'В корзине');

                            if (!!$this.data('multiAddingAllowed')) {

                                setTimeout(function() {

                                    $this
                                        .toggleClass(response.btnClass, false)
                                        .text($this.data('originalLabel'));

                                }, typeof $this.data('multiAddingAllowed') !== 'number' ? 2000 : $this.data('multiAddingAllowed'));

                            }
                            else if ($this.is('a') && !!response.btnUrl) {

                                $this
                                    .data('redirectAllowed', true)
                                    .data('url', $this.data('url') || $this.attr('href'))
                                    .attr('href', response.btnUrl);

                            }

                        }

                        if (!!response.cart) {

                            _updateCartWidget(response.cart);

                        }

                    }

                }
            });

        }

    }

    function _updateCartWidget(data) {

        var $footerCart = $('.b-footer_cart'),

            $footerCartSum = $('[data-sum]', $footerCart),
            $footerCartAmount = $('[data-amount]', $footerCart);

        data.amount = data.amount.isInteger() ? data.amount : 0;

        $footerCartSum
            .data('sum', data.sum)
            .text(data.sum);

        $footerCartAmount
            .data('sum', data.amount)
            .text(data.amount);

        $footerCart
            .toggleClass('show', data.amount > 0)

    }

    return {
        init: function() {

            // Add to
            addToCart();

            // Quick amount
            quickAmount();

            // Price ranges
            priceRanges();

        }
    };

})(window);